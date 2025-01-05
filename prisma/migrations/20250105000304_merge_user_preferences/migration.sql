/*
  Warnings:

  - You are about to drop the column `displayName` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPreferences" DROP CONSTRAINT "UserPreferences_userId_fkey";

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "displayName",
DROP COLUMN "email",
ADD COLUMN     "autoplayMedia" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFamilyStatus" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "UserPreferences";

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
