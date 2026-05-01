import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBasicBookingFieldsToAppointments1710000000002 implements MigrationInterface {
  name = 'AddBasicBookingFieldsToAppointments1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "patientMobile" VARCHAR`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentDate" DATE`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "status" VARCHAR NOT NULL DEFAULT 'BOOKED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "appointmentDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "patientMobile"`,
    );
  }
}
