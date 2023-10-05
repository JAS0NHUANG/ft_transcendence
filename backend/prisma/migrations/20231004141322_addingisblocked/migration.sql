-- DropIndex
DROP INDEX "User_achievements_key";

-- AlterTable
ALTER TABLE "UserInRoom" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
