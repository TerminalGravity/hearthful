/*
  Warnings:

  - A unique constraint covering the columns `[s3Key]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentType` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'TRIALING');

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "_EventParticipants" ADD CONSTRAINT "_EventParticipants_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventParticipants_AB_unique";

-- AlterTable
ALTER TABLE "_EventToGame" ADD CONSTRAINT "_EventToGame_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventToGame_AB_unique";

-- AlterTable
ALTER TABLE "_EventToMeal" ADD CONSTRAINT "_EventToMeal_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventToMeal_AB_unique";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAlbum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "familyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_familyId_key" ON "Subscription"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_s3Key_key" ON "Photo"("s3Key");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "PhotoAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
