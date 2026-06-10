import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeGatewayTransactionIdNullable1781200000000 implements MigrationInterface {
  name = 'MakeGatewayTransactionIdNullable1781200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "gateway_transaction_id" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "gateway_transaction_id" SET NOT NULL`)
  }
}
