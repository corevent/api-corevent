import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForgotPassword1778944489972 implements MigrationInterface {
    name = 'AddForgotPassword1778944489972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_recovery_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "code_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_25813f45b3266672a186e0c5dbb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_recovery_codes" ADD CONSTRAINT "FK_fc30202256f12fc3817dd6c66e5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_recovery_codes" DROP CONSTRAINT "FK_fc30202256f12fc3817dd6c66e5"`);
        await queryRunner.query(`DROP TABLE "password_recovery_codes"`);
    }

}
