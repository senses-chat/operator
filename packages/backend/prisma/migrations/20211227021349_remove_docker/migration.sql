/*
  Warnings:

  - The values [Wechaty] on the enum `RouteType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dockerOptions` on the `RasaServer` table. All the data in the column will be lost.
  - You are about to drop the column `host` on the `RasaServer` table. All the data in the column will be lost.
  - You are about to drop the column `port` on the `RasaServer` table. All the data in the column will be lost.
  - You are about to drop the `RasaHelperServer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `url` to the `RasaServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RouteType_new" AS ENUM ('Rasa', 'WechatApp', 'Saga');
ALTER TABLE "Route" ALTER COLUMN "sourceType" TYPE "RouteType_new" USING ("sourceType"::text::"RouteType_new");
ALTER TABLE "Route" ALTER COLUMN "destinationType" TYPE "RouteType_new" USING ("destinationType"::text::"RouteType_new");
ALTER TYPE "RouteType" RENAME TO "RouteType_old";
ALTER TYPE "RouteType_new" RENAME TO "RouteType";
DROP TYPE "RouteType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "RasaHelperServer" DROP CONSTRAINT "RasaHelperServer_botId_fkey";

-- AlterTable
ALTER TABLE "RasaServer" DROP COLUMN "dockerOptions",
DROP COLUMN "host",
DROP COLUMN "port",
ADD COLUMN     "url" VARCHAR NOT NULL;

-- DropTable
DROP TABLE "RasaHelperServer";
