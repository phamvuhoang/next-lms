-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_THE_BLANK');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "new_type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE';
UPDATE "Question" SET "new_type" = 'MULTIPLE_CHOICE' WHERE "type" = 'multiple_choice';
ALTER TABLE "Question" DROP COLUMN "type";
ALTER TABLE "Question" RENAME COLUMN "new_type" TO "type";
