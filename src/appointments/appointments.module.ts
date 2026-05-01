import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { AppointmentSlot } from './appointment-slot.entity';
import { Appointment } from './appointment.entity';
import {
  AppointmentsController,
  DoctorAppointmentsController,
} from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Appointment, AppointmentSlot])],
  controllers: [AppointmentsController, DoctorAppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
