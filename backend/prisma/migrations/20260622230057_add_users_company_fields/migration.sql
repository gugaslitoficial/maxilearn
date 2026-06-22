-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "notifCourseDone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifInactiveAlert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifNewUser" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "platformName" TEXT NOT NULL DEFAULT 'MaxiLearn',
ADD COLUMN     "secSessionHours" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "secStrongPassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "secTwoFactor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "site" TEXT,
ALTER COLUMN "primaryColor" SET DEFAULT '#CC1F1F',
ALTER COLUMN "secondaryColor" SET DEFAULT '#2A6FDB';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "lastAccessAt" TIMESTAMP(3);
