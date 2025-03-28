import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthorAndYearToBook1742946820000 implements MigrationInterface {
    name = 'AddAuthorAndYearToBook1742946820000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if columns exist before adding them
        const hasAuthorColumn = await queryRunner.hasColumn("book", "author");
        const hasYearColumn = await queryRunner.hasColumn("book", "year");
    
        if (!hasAuthorColumn) {
            await queryRunner.query(`
                ALTER TABLE "book" 
                ADD COLUMN "author" TEXT;
            `);
    
            // Ensure no NULL values exist before making it NOT NULL
            await queryRunner.query(`
                UPDATE "book" SET "author" = 'Неизвестный автор' WHERE "author" IS NULL;
            `);
    
            // Now that there are no NULL values, apply the NOT NULL constraint
            await queryRunner.query(`
                ALTER TABLE "book" 
                ALTER COLUMN "author" SET NOT NULL;
            `);
        }
    
        if (!hasYearColumn) {
            await queryRunner.query(`
                ALTER TABLE "book" 
                ADD COLUMN "year" INTEGER;
            `);
        }
    }
    

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "book"
            DROP COLUMN IF EXISTS "author",
            DROP COLUMN IF EXISTS "year";
        `);
    }
} 