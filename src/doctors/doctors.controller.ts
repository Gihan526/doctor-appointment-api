import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  createDoctor(
    @Body()
    body: {
      name: string;
      specialization?: string;
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
      dailyCapacity?: number;
    },
  ) {
    return this.doctorsService.createDoctor(body);
  }

  @Get()
  getDoctors() {
    return this.doctorsService.getDoctors();
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getDoctorById(Number(id));
  }
}
