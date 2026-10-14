import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventAttractions1779753228054 implements MigrationInterface {
    name = 'AddEventAttractions1779753228054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attractions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "guest" text NOT NULL, "event_id" uuid NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d3d084e18c4d4f07de9c1521ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attractions" ADD CONSTRAINT "FK_bf1f9cfc69a42d791c6a0316544" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attractions" DROP CONSTRAINT "FK_bf1f9cfc69a42d791c6a0316544"`);
        await queryRunner.query(`DROP TABLE "attractions"`);
    }

}
