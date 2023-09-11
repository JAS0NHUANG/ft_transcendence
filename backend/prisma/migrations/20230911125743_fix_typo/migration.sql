/*
  Warnings:

  - You are about to drop the column `frienRequestsSent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `friendReqestsReceived` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "frienRequestsSent",
DROP COLUMN "friendReqestsReceived",
ADD COLUMN     "friendRequestsReceived" TEXT[],
ADD COLUMN     "friendRequestsSent" TEXT[];
