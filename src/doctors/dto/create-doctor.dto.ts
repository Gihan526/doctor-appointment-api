import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
}
