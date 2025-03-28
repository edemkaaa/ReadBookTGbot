import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPagesColumn1742946839654 implements MigrationInterface {
    name = 'AddPagesColumn1742946839654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" ADD "pages" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "pages"`);
    }

}
