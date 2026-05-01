import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  createDoctor(data: {
    name: string;
    specialization?: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }): Promise<Doctor> {
    const doctor = this.doctorRepo.create({
      ...data,
      startTime: this.normalizeTime(data.startTime, 'startTime'),
      endTime: this.normalizeTime(data.endTime, 'endTime'),
    });

    return this.doctorRepo.save(doctor);
  }

  getDoctors() {
    return this.doctorRepo.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getDoctorById(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
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
}
