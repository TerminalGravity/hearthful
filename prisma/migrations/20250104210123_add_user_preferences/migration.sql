-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'en',
    "eventsUpdates" BOOLEAN NOT NULL DEFAULT true,
    "photosUpdates" BOOLEAN NOT NULL DEFAULT true,
    "mealsUpdates" BOOLEAN NOT NULL DEFAULT true,
    "gamesUpdates" BOOLEAN NOT NULL DEFAULT true,
    "autoplayMedia" BOOLEAN NOT NULL DEFAULT true,
    "showFamilyStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
