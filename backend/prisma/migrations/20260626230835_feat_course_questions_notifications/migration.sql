-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificateType" TEXT NOT NULL DEFAULT 'completion',
ADD COLUMN     "estimatedDurationMinutes" INTEGER,
ADD COLUMN     "minApprovalScore" INTEGER NOT NULL DEFAULT 70;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "displayCount" INTEGER;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuestion" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuestionReply" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseQuestionReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_companyId_idx" ON "Notification"("companyId");

-- CreateIndex
CREATE INDEX "CourseQuestion_lessonId_idx" ON "CourseQuestion"("lessonId");

-- CreateIndex
CREATE INDEX "CourseQuestion_authorId_idx" ON "CourseQuestion"("authorId");

-- CreateIndex
CREATE INDEX "CourseQuestion_companyId_idx" ON "CourseQuestion"("companyId");

-- CreateIndex
CREATE INDEX "CourseQuestionReply_questionId_idx" ON "CourseQuestionReply"("questionId");

-- CreateIndex
CREATE INDEX "CourseQuestionReply_authorId_idx" ON "CourseQuestionReply"("authorId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestion" ADD CONSTRAINT "CourseQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestion" ADD CONSTRAINT "CourseQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestion" ADD CONSTRAINT "CourseQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestion" ADD CONSTRAINT "CourseQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestionReply" ADD CONSTRAINT "CourseQuestionReply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CourseQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuestionReply" ADD CONSTRAINT "CourseQuestionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
