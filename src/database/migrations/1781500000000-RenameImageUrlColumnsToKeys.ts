import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameImageUrlColumnsToKeys1781500000000 implements MigrationInterface {
  name = 'RenameImageUrlColumnsToKeys1781500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatar_key"`)
    await queryRunner.query(`ALTER TABLE "events" RENAME COLUMN "banner_url" TO "banner_key"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" RENAME COLUMN "banner_key" TO "banner_url"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "avatar_key" TO "avatar_url"`)
  }
}
