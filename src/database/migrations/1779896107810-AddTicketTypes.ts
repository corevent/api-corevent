import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketTypes1779896107810 implements MigrationInterface {
    name = 'AddTicketTypes1779896107810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "name" text NOT NULL, "price" numeric(10,2) NOT NULL, "available_quantity" integer NOT NULL, "total_quantity" integer NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5510ce7e18a4edc648c9fbfc283" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ticket_types" ADD CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_types" DROP CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20"`);
        await queryRunner.query(`DROP TABLE "ticket_types"`);
    }

}
