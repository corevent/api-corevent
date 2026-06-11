import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameUserCpfToDocument1781300000000 implements MigrationInterface {
  name = 'RenameUserCpfToDocument1781300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_document_type_enum" AS ENUM('cpf', 'cnpj')`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "cpf" TO "document"`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "document" TYPE character(14)`)
    await queryRunner.query(
      `ALTER TABLE "users" ADD "document_type" "public"."users_document_type_enum" NOT NULL DEFAULT 'cpf'`,
    )
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "document_type" DROP DEFAULT`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "document_type"`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "document" TYPE character(11)`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "document" TO "cpf"`)
    await queryRunner.query(`DROP TYPE "public"."users_document_type_enum"`)
  }
}
