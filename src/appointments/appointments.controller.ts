import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Appointment } from './appointment.entity';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(): Promise<Appointment[]> {
    return this.appointmentsService.findAll();
  }
}

@Controller('doctors/:doctorId/appointments')
export class DoctorAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  bookTodayAppointment(
    @Param('doctorId') doctorId: string,
    @Body()
    body: {
      patientName: string;
      patientMobile: string;
    },
  ) {
    return this.appointmentsService.bookTodayAppointment(
      Number(doctorId),
      body,
    );
  }
}
