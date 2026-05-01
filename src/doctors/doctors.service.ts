import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor, WeekDay } from './doctor.entity';

const DEFAULT_AVAILABLE_DAYS = [
  WeekDay.Monday,
  WeekDay.Tuesday,
  WeekDay.Wednesday,
  WeekDay.Thursday,
  WeekDay.Friday,
  WeekDay.Saturday,
];

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
    dailyCapacity?: number;
    availableDays?: WeekDay[];
    weeklyOffDay?: WeekDay;
  }): Promise<Doctor> {
    const startTime = this.normalizeTime(data.startTime, 'startTime');
    const endTime = this.normalizeTime(data.endTime, 'endTime');

    const doctor = this.doctorRepo.create({
      ...data,
      startTime,
      endTime,
      dailyCapacity:
        data.dailyCapacity ??
        this.calculateSlotCapacity(
          startTime,
          endTime,
          data.slotDurationMinutes,
        ),
      availableDays: data.availableDays ?? DEFAULT_AVAILABLE_DAYS,
      weeklyOffDay: data.weeklyOffDay ?? WeekDay.Sunday,
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

  private calculateSlotCapacity(
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
  ): number {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const availableMinutes = endMinutes - startMinutes;

    if (availableMinutes <= 0) {
      throw new BadRequestException('endTime must be after startTime');
    }

    return Math.floor(availableMinutes / slotDurationMinutes);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }
}
