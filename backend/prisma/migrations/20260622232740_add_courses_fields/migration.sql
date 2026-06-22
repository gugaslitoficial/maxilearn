/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "isRestricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objectives" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "level" SET DEFAULT 'BASIC';

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'video';
