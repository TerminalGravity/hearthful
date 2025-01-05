-- AlterTable
ALTER TABLE "PhotoAlbum" ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "mealId" TEXT,
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "PhotoAlbum_mealId_idx" ON "PhotoAlbum"("mealId");

-- CreateIndex
CREATE INDEX "PhotoAlbum_gameId_idx" ON "PhotoAlbum"("gameId");

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAlbum" ADD CONSTRAINT "PhotoAlbum_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
