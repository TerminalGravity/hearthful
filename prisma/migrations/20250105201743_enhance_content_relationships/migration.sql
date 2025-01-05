-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "participants" TEXT[];

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "participants" TEXT[];

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "mealId" TEXT;

-- AlterTable
ALTER TABLE "PhotoAlbum" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Game_familyId_idx" ON "Game"("familyId");

-- CreateIndex
CREATE INDEX "Game_createdById_idx" ON "Game"("createdById");

-- CreateIndex
CREATE INDEX "Meal_familyId_idx" ON "Meal"("familyId");

-- CreateIndex
CREATE INDEX "Meal_createdById_idx" ON "Meal"("createdById");

-- CreateIndex
CREATE INDEX "Photo_mealId_idx" ON "Photo"("mealId");

-- CreateIndex
CREATE INDEX "Photo_gameId_idx" ON "Photo"("gameId");

-- CreateIndex
CREATE INDEX "PhotoAlbum_eventId_idx" ON "PhotoAlbum"("eventId");

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
