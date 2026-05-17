import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegistrationCode1778985770849 implements MigrationInterface {
    name = 'AddRegistrationCode1778985770849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "registration_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "code_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "attempts" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7b734becbb438c18b92f9350d79" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "registration_codes"`);
    }

}
