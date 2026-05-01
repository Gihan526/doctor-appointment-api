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

    const today = this.getTodayDate();
    const bookedCount = await this.appointmentsRepository.count({
      where: {
        doctor: { id: doctorId },
        appointmentDate: today,
        status: AppointmentStatus.Booked,
      },
    });

    if (bookedCount >= doctor.dailyCapacity) {
      throw new BadRequestException('No appointments available today');
    }

    const tokenNumber = bookedCount + 1;
    const appointment = this.appointmentsRepository.create({
      patientName: data.patientName,
      patientMobile: data.patientMobile,
      patientPhone: data.patientMobile,
      appointmentDate: today,
      tokenNumber,
      status: AppointmentStatus.Booked,
      reportingTime: doctor.startTime,
      doctor,
    });

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    return {
      message: 'Appointment booked successfully',
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

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
