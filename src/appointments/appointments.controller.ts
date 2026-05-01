import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':appointmentId')
  findOne(@Param('appointmentId') appointmentId: string) {
    return this.appointmentsService.findOne(Number(appointmentId));
  }

  @Patch(':appointmentId/cancel')
  cancelAppointment(@Param('appointmentId') appointmentId: string) {
    return this.appointmentsService.cancelAppointment(Number(appointmentId));
  }
}

@Controller('doctors/:doctorId/appointments')
export class DoctorAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findDoctorAppointments(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findDoctorAppointments(Number(doctorId));
  }

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
