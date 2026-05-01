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

  findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: {
        doctor: true,
        slot: true,
      },
    });
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

    const today = this.getDateString(new Date());
    const todayBookedCount = await this.countBookedAppointments(
      doctorId,
      today,
    );

    let appointmentDate = today;
    let tokenNumber = todayBookedCount + 1;
    let message = 'Appointment booked successfully';

    if (todayBookedCount >= doctor.dailyCapacity) {
      const tomorrow = this.getDateString(this.addDays(new Date(), 1));
      const tomorrowBookedCount = await this.countBookedAppointments(
        doctorId,
        tomorrow,
      );

      if (tomorrowBookedCount >= doctor.dailyCapacity) {
        throw new BadRequestException(
          'No appointments available today or tomorrow',
        );
      }

      appointmentDate = tomorrow;
      tokenNumber = tomorrowBookedCount + 1;
      message =
        'No appointments available today. Appointment booked for tomorrow.';
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
      message,
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
