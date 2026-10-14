import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserHaveDocumentInsteadCpf1781137169670 implements MigrationInterface {
    name = 'MakeUserHaveDocumentInsteadCpf1781137169670'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }

}
