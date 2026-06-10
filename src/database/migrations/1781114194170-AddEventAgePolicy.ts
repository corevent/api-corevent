import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventAgePolicy1781114194170 implements MigrationInterface {
    name = 'AddEventAgePolicy1781114194170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "age_policy_acceptances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "age_policy_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4d9370d3ce29f7076f6c4ffad06" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "age_policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "version" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_09e4324ffa4ceae9a13bee655e9" UNIQUE ("version"), CONSTRAINT "PK_121d94d2dc57b9fa2ca2bf5b6e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_access_level_enum" RENAME TO "event_staff_access_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_access_level_enum" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`ALTER TABLE "event_staff" ALTER COLUMN "access_level" TYPE "public"."event_staff_access_level_enum" USING "access_level"::"text"::"public"."event_staff_access_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_access_level_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_invitations_invitation_status_enum" RENAME TO "event_staff_invitations_invitation_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_invitation_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ALTER COLUMN "invitation_status" TYPE "public"."event_staff_invitations_invitation_status_enum" USING "invitation_status"::"text"::"public"."event_staff_invitations_invitation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_invitation_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_invitations_original_access_level_enum" RENAME TO "event_staff_invitations_original_access_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_original_access_level_enum" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ALTER COLUMN "original_access_level" TYPE "public"."event_staff_invitations_original_access_level_enum" USING "original_access_level"::"text"::"public"."event_staff_invitations_original_access_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_original_access_level_enum_old"`);
        await queryRunner.query(`ALTER TABLE "age_policy_acceptances" ADD CONSTRAINT "FK_2cc6a53435fd7c37187c93f62c5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "age_policy_acceptances" ADD CONSTRAINT "FK_cdd983ebc9c0bcfc819b386fc0d" FOREIGN KEY ("age_policy_id") REFERENCES "age_policies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "age_policy_acceptances" DROP CONSTRAINT "FK_cdd983ebc9c0bcfc819b386fc0d"`);
        await queryRunner.query(`ALTER TABLE "age_policy_acceptances" DROP CONSTRAINT "FK_2cc6a53435fd7c37187c93f62c5"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_original_access_level_enum_old" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ALTER COLUMN "original_access_level" TYPE "public"."event_staff_invitations_original_access_level_enum_old" USING "original_access_level"::"text"::"public"."event_staff_invitations_original_access_level_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_original_access_level_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_invitations_original_access_level_enum_old" RENAME TO "event_staff_invitations_original_access_level_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_invitations_invitation_status_enum_old" AS ENUM('pending', 'accepted', 'rejected', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "event_staff_invitations" ALTER COLUMN "invitation_status" TYPE "public"."event_staff_invitations_invitation_status_enum_old" USING "invitation_status"::"text"::"public"."event_staff_invitations_invitation_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_invitations_invitation_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_invitations_invitation_status_enum_old" RENAME TO "event_staff_invitations_invitation_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."event_staff_access_level_enum_old" AS ENUM('readonly', 'checkin')`);
        await queryRunner.query(`ALTER TABLE "event_staff" ALTER COLUMN "access_level" TYPE "public"."event_staff_access_level_enum_old" USING "access_level"::"text"::"public"."event_staff_access_level_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."event_staff_access_level_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."event_staff_access_level_enum_old" RENAME TO "event_staff_access_level_enum"`);
        await queryRunner.query(`DROP TABLE "age_policies"`);
        await queryRunner.query(`DROP TABLE "age_policy_acceptances"`);
    }

}
