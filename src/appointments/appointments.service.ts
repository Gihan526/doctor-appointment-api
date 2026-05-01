import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment, AppointmentStatus } from './appointment.entity';

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

  async bookTodayAppointment(
    doctorId: number,
    data: {
      patientName: string;
      patientMobile: string;
    },
  ) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const today = new Date();
    const todayDateString = this.getDateString(today);
    let appointmentDate: string | null = null;
    let tokenNumber: number | null = null;

    for (let dayOffset = 0; dayOffset <= 3; dayOffset += 1) {
      const dateToCheck = this.addDays(today, dayOffset);

      if (this.isSunday(dateToCheck)) {
        continue;
      }

      const dateString = this.getDateString(dateToCheck);
      const bookedCount = await this.countBookedAppointments(
        doctorId,
        dateString,
      );

      if (bookedCount < doctor.dailyCapacity) {
        appointmentDate = dateString;
        tokenNumber = bookedCount + 1;
        break;
      }
    }

    if (!appointmentDate || !tokenNumber) {
      throw new BadRequestException(
        'No appointments available in the next 3 days',
      );
    }

    const appointment = this.appointmentsRepository.create({
      patientName: data.patientName,
      patientMobile: data.patientMobile,
      patientPhone: data.patientMobile,
      appointmentDate,
      tokenNumber,
      status: AppointmentStatus.Booked,
      reportingTime: doctor.startTime,
      doctor,
    });

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    return {
      message:
        appointmentDate === todayDateString
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
        status: savedAppointment.status,
      },
    };
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

  private isSunday(date: Date): boolean {
    return date.getDay() === 0;
  }

  private countBookedAppointments(
    doctorId: number,
    date: string,
  ): Promise<number> {
    return this.appointmentsRepository.count({
      where: {
        doctor: { id: doctorId },
        appointmentDate: date,
        status: AppointmentStatus.Booked,
      },
    });
  }
}
