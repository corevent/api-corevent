import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrderPendingRefundStatus1781700000000 implements MigrationInterface {
  name = 'AddOrderPendingRefundStatus1781700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'pending_refund'`)
  }

  public async down(): Promise<void> {
    // PostgreSQL cannot remove enum values safely without recreating the type.
  }
}
