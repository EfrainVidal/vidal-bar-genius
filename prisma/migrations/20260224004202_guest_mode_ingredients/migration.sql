/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,type]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestId,name,type]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Ingredient_guestId_idx" ON "Ingredient"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_userId_name_type_key" ON "Ingredient"("userId", "name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_guestId_name_type_key" ON "Ingredient"("guestId", "name", "type");
