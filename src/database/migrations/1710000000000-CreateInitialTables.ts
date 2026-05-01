import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1710000000000 implements MigrationInterface {
  name = 'CreateInitialTables1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "doctors" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "specialization" VARCHAR,
        "startTime" TIME NOT NULL,
        "endTime" TIME NOT NULL,
        "slotDurationMinutes" INTEGER NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "appointment_slots" (
        "id" SERIAL PRIMARY KEY,
        "date" DATE NOT NULL,
        "startTime" TIME NOT NULL,
        "endTime" TIME NOT NULL,
        "isBooked" BOOLEAN NOT NULL DEFAULT false,
        "doctorId" INTEGER,
        CONSTRAINT "FK_appointment_slots_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id")
          ON DELETE CASCADE,
        CONSTRAINT "UQ_doctor_date_startTime"
          UNIQUE ("doctorId", "date", "startTime")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" SERIAL PRIMARY KEY,
        "patientPhone" VARCHAR NOT NULL,
        "patientName" VARCHAR,
        "reasonForVisit" VARCHAR,
        "tokenNumber" INTEGER NOT NULL,
        "reportingTime" TIME NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "doctorId" INTEGER,
        "slotId" INTEGER,
        CONSTRAINT "FK_appointments_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id"),
        CONSTRAINT "FK_appointments_slot"
          FOREIGN KEY ("slotId")
          REFERENCES "appointment_slots"("id"),
        CONSTRAINT "UQ_appointments_slot"
          UNIQUE ("slotId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TABLE "appointment_slots"`);
    await queryRunner.query(`DROP TABLE "doctors"`);
  }
}
