import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrderFailedStatusAndPriceCheck1781600000000 implements MigrationInterface {
  name = 'AddOrderFailedStatusAndPriceCheck1781600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'failed'`)
    await queryRunner.query(
      `ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_price_non_negative" CHECK (price >= 0)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ticket_types" DROP CONSTRAINT "ticket_types_price_non_negative"`)
  }
}
