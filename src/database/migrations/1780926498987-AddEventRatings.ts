import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventRatings1780926498987 implements MigrationInterface {
    name = 'AddEventRatings1780926498987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event_ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "rating" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1a40669403a8ea520987fcb5396" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event_ratings" ADD CONSTRAINT "FK_61b966fade12697c51e995fd0f6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_ratings" ADD CONSTRAINT "FK_b040edbf3fa45022e456098c4df" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_ratings" DROP CONSTRAINT "FK_b040edbf3fa45022e456098c4df"`);
        await queryRunner.query(`ALTER TABLE "event_ratings" DROP CONSTRAINT "FK_61b966fade12697c51e995fd0f6"`);
        await queryRunner.query(`DROP TABLE "event_ratings"`);
    }

}
