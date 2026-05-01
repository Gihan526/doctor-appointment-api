import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { AppointmentSlot } from '../appointments/appointment-slot.entity';
import { Appointment } from '../appointments/appointment.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'doctor_appointment_db',
  synchronize: false,
  logging: true,
  entities: [Doctor, AppointmentSlot, Appointment],
  migrations: ['src/database/migrations/*.ts'],
});

export default AppDataSource;
