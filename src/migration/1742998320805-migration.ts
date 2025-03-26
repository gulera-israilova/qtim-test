import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742998320805 implements MigrationInterface {
  name = 'Migration1742998320805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "surname" character varying, "middleName" character varying, "name" character varying NOT NULL, "login" character varying NOT NULL, "hash" character varying(500) NOT NULL, "key" character varying(500) NOT NULL, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying(100) NOT NULL, "description" character varying NOT NULL, "created_by_id" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_baf41162b735ea17e1bf967c9e5" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
    INSERT INTO "user" (id, created_at, login, name, surname, "middleName", key, hash)
    VALUES ('9a0e516f-9e79-4ddf-8792-01a57776a7e6', now(), 'user', 'user', 'user', 'user', '7ddPObKjJm', 'd3fc6be95ed143a7d712d6b5f80869c305b018fcd8871d797fbb12bbb64b19c0');
  `);

    await queryRunner.query(`
   INSERT INTO article (id, created_at, title, description, created_by_id)
   VALUES 
  ('ae796564-bc9e-4e8e-b41c-b1ce54e8d5c7', now(), 'Phone', 'Phone description', '9a0e516f-9e79-4ddf-8792-01a57776a7e6'),
  ('0734a5e3-12c4-442c-8f82-c52c5ca454a7', now(), 'Computer', 'Computer description', '9a0e516f-9e79-4ddf-8792-01a57776a7e6');


  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_baf41162b735ea17e1bf967c9e5"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
