import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from './appointment.entity';

@Entity('appointment_slots')
export class AppointmentSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'boolean', default: false })
  isBooked: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.slots, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  doctor: Doctor | null;

  @OneToOne(() => Appointment, (appointment) => appointment.slot)
  appointment: Appointment | null;
}
