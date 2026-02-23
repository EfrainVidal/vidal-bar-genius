/*
  Warnings:

  - Made the column `userId` on table `AnalyticsEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AnalyticsEvent" ALTER COLUMN "userId" SET NOT NULL;
