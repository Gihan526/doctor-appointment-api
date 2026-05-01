import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor, WeekDay } from '../doctors/doctor.entity';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';

type SlotAvailability = {
  tokenNumber: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}

  async findAll() {
    const appointments = await this.appointmentsRepository.find({
      relations: {
        doctor: true,
        slot: true,
      },
      order: {
        appointmentDate: 'ASC',
        tokenNumber: 'ASC',
      },
    });

    return {
      message: 'Appointments fetched successfully',
      data: appointments,
    };
  }

  async findOne(appointmentId: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: {
        doctor: true,
        slot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      message: 'Appointment fetched successfully',
      data: appointment,
    };
  }

  async findDoctorAppointments(doctorId: number) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.appointmentsRepository.find({
      where: {
        doctor: { id: doctorId },
      },
      relations: {
        doctor: true,
        slot: true,
      },
      order: {
        appointmentDate: 'ASC',
        tokenNumber: 'ASC',
      },
    });

    return {
      message: 'Doctor appointments fetched successfully',
      data: appointments,
    };
  }

  async bookTodayAppointment(doctorId: number, data: BookAppointmentDto) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const today = new Date();
    const todayDateString = this.getDateString(today);
    const selectedSlot = data.appointmentDate
      ? await this.getSelectedSlot(doctor, data)
      : await this.getNextAvailableSlot(doctor, today);

    const appointment = this.appointmentsRepository.create({
      patientName: data.patientName ?? null,
      patientMobile: data.patientMobile,
      patientPhone: data.patientMobile,
      reasonForVisit: data.reasonForVisit ?? null,
      appointmentDate: selectedSlot.appointmentDate,
      tokenNumber: selectedSlot.tokenNumber,
      status: AppointmentStatus.Booked,
      reportingTime: selectedSlot.reportingTime,
      doctor,
    });

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    return {
      message:
        selectedSlot.appointmentDate === todayDateString
          ? 'Appointment booked successfully'
          : 'No appointments available today. Appointment booked for next available day.',
      data: {
        appointmentId: savedAppointment.id,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: savedAppointment.patientName,
        patientMobile: savedAppointment.patientMobile,
        appointmentDate: savedAppointment.appointmentDate,
        tokenNumber: savedAppointment.tokenNumber,
        reportingTime: savedAppointment.reportingTime,
        status: savedAppointment.status,
      },
    };
  }

  async getDoctorAvailability(doctorId: number, date?: string) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const requestedDate = date ? this.parseDateString(date) : new Date();
    const availability = await this.getAvailabilityForDate(
      doctor,
      requestedDate,
    );

    return {
      message: 'Doctor availability fetched successfully',
      data: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        ...availability,
      },
    };
  }

  private async getSelectedSlot(doctor: Doctor, data: BookAppointmentDto) {
    if (!data.reportingTime) {
      throw new BadRequestException(
        'reportingTime is required when appointmentDate is provided',
      );
    }

    const requestedDate = this.parseDateString(data.appointmentDate!);
    this.validateSelectedDate(requestedDate);

    const reportingTime = this.normalizeTime(
      data.reportingTime,
      'reportingTime',
    );
    const availability = await this.getAvailabilityForDate(
      doctor,
      requestedDate,
    );

    if (!availability.isWorkingDay) {
      throw new BadRequestException('Doctor is not available on selected date');
    }

    const slot = availability.slots.find(
      (availableSlot) => availableSlot.startTime === reportingTime,
    );

    if (!slot) {
      throw new BadRequestException('Selected reporting time is not available');
    }

    if (slot.isBooked) {
      throw new BadRequestException(
        'Selected reporting time is already booked',
      );
    }

    return {
      appointmentDate: availability.appointmentDate,
      tokenNumber: slot.tokenNumber,
      reportingTime: slot.startTime,
    };
  }

  private async getNextAvailableSlot(doctor: Doctor, startDate: Date) {
    for (let dayOffset = 0; dayOffset <= 3; dayOffset += 1) {
      const dateToCheck = this.addDays(startDate, dayOffset);
      const availability = await this.getAvailabilityForDate(
        doctor,
        dateToCheck,
      );
      const firstAvailableSlot = availability.slots.find(
        (slot) => !slot.isBooked,
      );

      if (firstAvailableSlot) {
        return {
          appointmentDate: availability.appointmentDate,
          tokenNumber: firstAvailableSlot.tokenNumber,
          reportingTime: firstAvailableSlot.startTime,
        };
      }
    }

    throw new BadRequestException(
      'No appointments available in the next 3 days. Please try after sometime',
    );
  }

  private async getAvailabilityForDate(doctor: Doctor, date: Date) {
    const appointmentDate = this.getDateString(date);

    if (!this.isDoctorWorkingDay(doctor, date)) {
      return {
        appointmentDate,
        isWorkingDay: false,
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        slots: [] as SlotAvailability[],
      };
    }

    const slots = this.generateSlots(doctor);
    const bookedAppointments = await this.appointmentsRepository.find({
      where: {
        doctor: { id: doctor.id },
        appointmentDate,
        status: AppointmentStatus.Booked,
      },
    });
    const bookedTimes = new Set(
      bookedAppointments.map((appointment) => appointment.reportingTime),
    );
    const slotsWithBookingStatus = slots.map((slot) => ({
      ...slot,
      isBooked: bookedTimes.has(slot.startTime),
    }));
    const bookedSlots = slotsWithBookingStatus.filter(
      (slot) => slot.isBooked,
    ).length;

    return {
      appointmentDate,
      isWorkingDay: true,
      totalSlots: slotsWithBookingStatus.length,
      bookedSlots,
      availableSlots: slotsWithBookingStatus.length - bookedSlots,
      slots: slotsWithBookingStatus,
    };
  }

  private generateSlots(doctor: Doctor): SlotAvailability[] {
    const slots: SlotAvailability[] = [];
    const startMinutes = this.timeToMinutes(doctor.startTime);
    const endMinutes = this.timeToMinutes(doctor.endTime);
    let currentMinutes = startMinutes;

    while (
      currentMinutes + doctor.slotDurationMinutes <= endMinutes &&
      slots.length < doctor.dailyCapacity
    ) {
      const nextMinutes = currentMinutes + doctor.slotDurationMinutes;

      slots.push({
        tokenNumber: slots.length + 1,
        startTime: this.minutesToTime(currentMinutes),
        endTime: this.minutesToTime(nextMinutes),
        isBooked: false,
      });

      currentMinutes = nextMinutes;
    }

    return slots;
  }

  private isDoctorWorkingDay(doctor: Doctor, date: Date): boolean {
    const weekDay = this.getWeekDay(date);

    if (weekDay === doctor.weeklyOffDay) {
      return false;
    }

    return doctor.availableDays.includes(weekDay);
  }

  private parseDateString(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        'appointmentDate must be in YYYY-MM-DD format',
      );
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime()) || this.getDateString(date) !== value) {
      throw new BadRequestException('appointmentDate is invalid');
    }

    return date;
  }

  private validateSelectedDate(date: Date): void {
    const today = new Date();
    const selectedDateString = this.getDateString(date);
    const todayDateString = this.getDateString(today);
    const maxDateString = this.getDateString(this.addDays(today, 3));

    if (selectedDateString < todayDateString) {
      throw new BadRequestException('appointmentDate cannot be in the past');
    }

    if (selectedDateString > maxDateString) {
      throw new BadRequestException(
        'appointmentDate must be within the next 3 days',
      );
    }
  }

  async cancelAppointment(appointmentId: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: {
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      return {
        message: 'Appointment already cancelled',
        data: {
          appointmentId: appointment.id,
          status: appointment.status,
        },
      };
    }

    appointment.status = AppointmentStatus.Cancelled;
    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    return {
      message: 'Appointment cancelled successfully',
      data: {
        appointmentId: savedAppointment.id,
        status: savedAppointment.status,
      },
    };
  }

  private getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
  }

  private getWeekDay(date: Date): WeekDay {
    const weekDays = [
      WeekDay.Sunday,
      WeekDay.Monday,
      WeekDay.Tuesday,
      WeekDay.Wednesday,
      WeekDay.Thursday,
      WeekDay.Friday,
      WeekDay.Saturday,
    ];

    return weekDays[date.getDay()];
  }

  private normalizeTime(value: string, fieldName: string): string {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!timePattern.test(value)) {
      throw new BadRequestException(
        `${fieldName} must be in HH:MM or HH:MM:SS format`,
      );
    }

    return value.length === 5 ? `${value}:00` : value;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }
}
