import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { AppointmentSlot } from './appointment-slot.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  patientPhone: string;

  @Column({ type: 'varchar', nullable: true })
  patientName: string | null;

  @Column({ type: 'varchar', nullable: true })
  reasonForVisit: string | null;

  @Column({ type: 'integer' })
  tokenNumber: number;

  @Column({ type: 'time' })
  reportingTime: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    nullable: true,
  })
  doctor: Doctor | null;

  @OneToOne(() => AppointmentSlot, (slot) => slot.appointment, {
    nullable: true,
  })
  @JoinColumn()
  slot: AppointmentSlot | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
