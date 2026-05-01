import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDailyCapacityToDoctors1710000000001 implements MigrationInterface {
  name = 'AddDailyCapacityToDoctors1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "dailyCapacity" INTEGER NOT NULL DEFAULT 30`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP COLUMN "dailyCapacity"`,
    );
  }
}
