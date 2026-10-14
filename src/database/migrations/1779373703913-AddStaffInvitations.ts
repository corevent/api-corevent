import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffInvitations1779373703913 implements MigrationInterface {
    name = 'AddStaffInvitations1779373703913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_staff" RENAME COLUMN "invitation_status" TO "staff_invitation_id"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_invitation_status_enum" RENAME TO "event_staff_staff_invitation_id_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_invitation_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'canceled')`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_original_access_level_enum" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`CREATE TABLE "event_staff_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "invitation_status" "public"."event_staff_invitations_invitation_status_enum" NOT NULL, "original_access_level" "public"."event_staff_invitations_original_access_level_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5b46c8d7b7276567f2d93b09b0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event_staff" DROP COLUMN "staff_invitation_id"`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD "staff_invitation_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD CONSTRAINT "UQ_d1b7362aa881f1c07d0114cecc9" UNIQUE ("staff_invitation_id")`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ADD CONSTRAINT "FK_e796ea4c3ccbd7c578641e1c386" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ADD CONSTRAINT "FK_26261e8f5678ed81091c77bb199" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD CONSTRAINT "FK_d1b7362aa881f1c07d0114cecc9" FOREIGN KEY ("staff_invitation_id") REFERENCES "event_staff_invitations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_staff" DROP CONSTRAINT "FK_d1b7362aa881f1c07d0114cecc9"`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" DROP CONSTRAINT "FK_26261e8f5678ed81091c77bb199"`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" DROP CONSTRAINT "FK_e796ea4c3ccbd7c578641e1c386"`);
        await queryRunner.query(`ALTER TABLE "event_staff" DROP CONSTRAINT "UQ_d1b7362aa881f1c07d0114cecc9"`);
        await queryRunner.query(`ALTER TABLE "event_staff" DROP COLUMN "staff_invitation_id"`);
        await queryRunner.query(`ALTER TABLE "event_staff" ADD "staff_invitation_id" "public"."event_staff_staff_invitation_id_enum"`);
        await queryRunner.query(`DROP TABLE "event_staff_invitations"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_original_access_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_invitation_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_staff_invitation_id_enum" RENAME TO "event_staff_invitation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "event_staff" RENAME COLUMN "staff_invitation_id" TO "invitation_status"`);
    }

}
