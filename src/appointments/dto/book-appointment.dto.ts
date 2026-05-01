import { IsNotEmpty, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsString()
  @IsNotEmpty()
  patientMobile: string;
}
