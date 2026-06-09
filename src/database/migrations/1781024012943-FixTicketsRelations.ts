import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixTicketsRelations1781024012943 implements MigrationInterface {
  name = 'FixTicketsRelations1781024012943'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "tickets" t
      SET "user_id" = o."user_id"::text
      FROM "orders" o
      WHERE t."order_id" = o."id"
    `)
    await queryRunner.query(`
      UPDATE "tickets" t
      SET "event_id" = o."event_id"::text
      FROM "orders" o
      WHERE t."order_id" = o."id"
    `)
    await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid`)
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "ticket_type_id" TYPE uuid USING "ticket_type_id"::uuid`,
    )
    await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "event_id" TYPE uuid USING "event_id"::uuid`)
    await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "checkin_by" TYPE uuid USING "checkin_by"::uuid`)
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_2e445270177206a97921e461710" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_a95369aeea12da7fde110e95e00" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_fc2e2b86e7702eb9ae3e3028ded" FOREIGN KEY ("checkin_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_fc2e2b86e7702eb9ae3e3028ded"`)
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_a95369aeea12da7fde110e95e00"`)
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_2e445270177206a97921e461710"`)
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea"`)
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "checkin_by" TYPE character varying USING "checkin_by"::text`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "event_id" TYPE character varying USING "event_id"::text`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "ticket_type_id" TYPE character varying USING "ticket_type_id"::text`,
    )
    await queryRunner.query(
      `ALTER TABLE "tickets" ALTER COLUMN "user_id" TYPE character varying USING "user_id"::text`,
    )
  }
}
