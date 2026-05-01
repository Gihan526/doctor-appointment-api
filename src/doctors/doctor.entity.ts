import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { AppointmentSlot } from '../appointments/appointment-slot.entity';

export enum WeekDay {
  Monday = 'MONDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY',
  Thursday = 'THURSDAY',
  Friday = 'FRIDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  specialization!: string | null;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'integer' })
  slotDurationMinutes!: number;

  @Column({ type: 'integer', default: 30 })
  dailyCapacity!: number;

  @Column({
    type: 'text',
    array: true,
    default: () =>
      "ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::text[]",
  })
  availableDays!: WeekDay[];

  @Column({ type: 'varchar', default: WeekDay.Sunday })
  weeklyOffDay!: WeekDay;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments!: Appointment[];

  @OneToMany(() => AppointmentSlot, (slot) => slot.doctor)
  slots!: AppointmentSlot[];
}
