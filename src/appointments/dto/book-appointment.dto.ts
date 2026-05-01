import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsString()
  @IsOptional()
  patientName?: string;

  @IsString()
  @IsNotEmpty()
  patientMobile!: string;

  @IsOptional()
  @IsString()
  reasonForVisit?: string;

  @IsOptional()
  @IsString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  reportingTime?: string;
}
