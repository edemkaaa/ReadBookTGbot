import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1742946801665 implements MigrationInterface {
    name = 'InitSchema1742946801665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "book" (
                "id" SERIAL PRIMARY KEY,
                "title" character varying NOT NULL,
                "fileName" character varying NOT NULL,
                "description" text,
                "filePath" character varying NOT NULL,
                "userId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "book"`);
    }
}
