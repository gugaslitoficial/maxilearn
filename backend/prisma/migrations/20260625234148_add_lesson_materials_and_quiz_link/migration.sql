-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "materials" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "lessonId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
