import { MigrationInterface, QueryRunner } from 'typeorm'

export class UnaccentExtension1778370539670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS unaccent')
  }
}
