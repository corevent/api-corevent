import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPhoneNumber1779711854576 implements MigrationInterface {
    name = 'AddUserPhoneNumber1779711854576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone_number" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
    }

}
