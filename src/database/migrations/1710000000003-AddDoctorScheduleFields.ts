import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorScheduleFields1710000000003 implements MigrationInterface {
  name = 'AddDoctorScheduleFields1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "availableDays" TEXT[] NOT NULL DEFAULT ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::TEXT[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "weeklyOffDay" VARCHAR NOT NULL DEFAULT 'SUNDAY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "weeklyOffDay"`);
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP COLUMN "availableDays"`,
    );
  }
}
