/*
  Warnings:

  - Added the required column `userId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "userEmail" VARCHAR(255),
ADD COLUMN     "userId" VARCHAR(100) NOT NULL;
