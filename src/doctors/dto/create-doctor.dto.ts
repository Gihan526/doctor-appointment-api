import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsIn,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { WeekDay } from '../doctor.entity';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @Type(() => Number)
  @IsInt()
  @IsIn([10, 15, 30])
  slotDurationMinutes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dailyCapacity?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.values(WeekDay), { each: true })
  availableDays?: WeekDay[];

  @IsOptional()
  @IsIn(Object.values(WeekDay))
  weeklyOffDay?: WeekDay;
}
