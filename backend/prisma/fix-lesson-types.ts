/**
 * One-off script to fix lesson types that were incorrectly stored as "video"
 * due to the CourseWizard not persisting the type field on quiz/file lessons.
 *
 * Run with:
 *   npx tsx prisma/fix-lesson-types.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fix quiz lessons: where a Quiz row references a Lesson but that Lesson has type = "video"
  const quizFixed = await prisma.$executeRaw`
    UPDATE "Lesson"
    SET    type = 'quiz'
    FROM   "Quiz"
    WHERE  "Quiz"."lessonId" = "Lesson"."id"
      AND  "Lesson"."type"   = 'video'
  `;
  console.log(`quiz lessons fixed: ${quizFixed}`);

  // Fix file lessons: materials not empty, no video URL, no quiz reference, type = "video"
  const fileFixed = await prisma.$executeRaw`
    UPDATE "Lesson"
    SET    type = 'file'
    WHERE  "materials"  != '[]'::jsonb
      AND  "videoUrl"   IS NULL
      AND  "type"       = 'video'
      AND  "id" NOT IN (
        SELECT "lessonId" FROM "Quiz" WHERE "lessonId" IS NOT NULL
      )
  `;
  console.log(`file lessons fixed: ${fileFixed}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
