import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1778421936024 implements MigrationInterface {
    name = 'InitialSchema1778421936024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "states" ("id" integer NOT NULL, "name" text NOT NULL, "acronym" character(2) NOT NULL, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" integer NOT NULL, "state_id" integer NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_location_type_enum" AS ENUM('online', 'in_person', 'hybrid')`);
        await queryRunner.query(`CREATE TYPE "public"."events_category_enum" AS ENUM('music', 'sports', 'tech', 'business', 'education', 'art_culture', 'gastronomy', 'health_wellness', 'family_kids', 'religious_spiritual', 'games', 'community_social', 'fashion_beauty', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'opened', 'going', 'canceled', 'finished')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizer_id" uuid NOT NULL, "title" text NOT NULL, "description" text, "max_participants" integer, "location_type" "public"."events_location_type_enum" NOT NULL, "location_name" text, "city_id" integer, "zip_code" character varying(8), "neighborhood" text, "street" text, "number" integer, "complement" text, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "category" "public"."events_category_enum" NOT NULL, "banner_url" text, "is_adult_only" boolean NOT NULL DEFAULT false, "event_changes_id" character varying, "change_refund_deadline" TIMESTAMP WITH TIME ZONE, "status" "public"."events_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_changes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "changed_fields" text array NOT NULL, "old_value" jsonb NOT NULL, "new_value" jsonb NOT NULL, "changed_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_144c97512f25c051c6b89766401" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organizer_payment_info_pix_type_enum" AS ENUM('cpf', 'cnpj', 'email', 'phone', 'random')`);
        await queryRunner.query(`CREATE TABLE "organizer_payment_info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "description" text NOT NULL, "branch_number" character varying(4), "branch_digit" character varying(1), "account_number" character varying(10), "account_digit" character varying(1), "pix_key" text, "pix_type" "public"."organizer_payment_info_pix_type_enum", "bank_code" character varying(10), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c00ef7ba0c0cebd419542175d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "email" text NOT NULL, "cpf" character(11) NOT NULL, "birth_date" date NOT NULL, "password_hash" text NOT NULL, "avatar_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_230b925048540454c8b4c481e1c" UNIQUE ("cpf"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_hash" text NOT NULL, "jti" uuid NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_1229b56aa12cae674b824fccd13" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_53a3ffaa30453fb76c0822c2362" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_changes" ADD CONSTRAINT "FK_39df8fcc8843b943b2ff643a237" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_changes" ADD CONSTRAINT "FK_f941b49968841ec93c975017e65" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizer_payment_info" ADD CONSTRAINT "FK_2803a0b778d5c76e59622195428" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`ALTER TABLE "organizer_payment_info" DROP CONSTRAINT "FK_2803a0b778d5c76e59622195428"`);
        await queryRunner.query(`ALTER TABLE "event_changes" DROP CONSTRAINT "FK_f941b49968841ec93c975017e65"`);
        await queryRunner.query(`ALTER TABLE "event_changes" DROP CONSTRAINT "FK_39df8fcc8843b943b2ff643a237"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_53a3ffaa30453fb76c0822c2362"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_1229b56aa12cae674b824fccd13"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "organizer_payment_info"`);
        await queryRunner.query(`DROP TYPE "public"."organizer_payment_info_pix_type_enum"`);
        await queryRunner.query(`DROP TABLE "event_changes"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_location_type_enum"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "states"`);
    }

}
