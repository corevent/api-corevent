import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventStaff1779198423712 implements MigrationInterface {
    name = 'AddEventStaff1779198423712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_staff_access_level_enum" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitation_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "event_staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "access_level" "public"."event_staff_access_level_enum" NOT NULL, "invitation_status" "public"."event_staff_invitation_status_enum", "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3f175d4e63d2fef8d80c4a598f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD CONSTRAINT "FK_43774b1303787faac5b3ae85bd7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD CONSTRAINT "FK_3e0cc23cd947b14e06221268d78" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_staff" DROP CONSTRAINT "FK_3e0cc23cd947b14e06221268d78"`);
        await queryRunner.query(`ALTER TABLE "event_staff" DROP CONSTRAINT "FK_43774b1303787faac5b3ae85bd7"`);
        await queryRunner.query(`DROP TABLE "event_staff"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_access_level_enum"`);
    }

}
