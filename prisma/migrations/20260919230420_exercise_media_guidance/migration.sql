-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "commonMistakes" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "formTips" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "safetyNotes" TEXT;

-- CreateTable
CREATE TABLE "ExerciseMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "duration" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseMedia_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseInstruction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    CONSTRAINT "ExerciseInstruction_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExerciseMedia_exerciseId_sortOrder_idx" ON "ExerciseMedia"("exerciseId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseInstruction_exerciseId_step_key" ON "ExerciseInstruction"("exerciseId", "step");
