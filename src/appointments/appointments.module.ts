import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { AppointmentSlot } from './appointment-slot.entity';
import { Appointment } from './appointment.entity';
import {
  AppointmentsController,
  DoctorAvailabilityController,
  DoctorAppointmentsController,
} from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Appointment, AppointmentSlot])],
  controllers: [
    AppointmentsController,
    DoctorAppointmentsController,
    DoctorAvailabilityController,
  ],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
