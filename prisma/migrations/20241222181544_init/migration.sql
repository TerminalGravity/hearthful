/*
  Warnings:

  - You are about to drop the column `notifications` on the `UserPreference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "notifications",
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "eventsUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gamesUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mealsUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photosUpdates" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "theme" SET DEFAULT 'system';
