import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrderItems1781400000000 implements MigrationInterface {
  name = 'AddOrderItems1781400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "ticket_type_id" uuid NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_order_items" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_ticket_type" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_order_id"`)
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_ticket_type"`)
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`)
    await queryRunner.query(`DROP TABLE "order_items"`)
  }
}
