/*
  Warnings:

  - Added the required column `corpId` to the `WxkfAccountLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WxkfAccountLink" ADD COLUMN     "corpId" VARCHAR NOT NULL;

-- CreateIndex
CREATE INDEX "WxkfAccountLink_corpId_openKfId_idx" ON "WxkfAccountLink"("corpId", "openKfId");
