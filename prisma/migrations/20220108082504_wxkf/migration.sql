/*
  Warnings:

  - The values [Wecom] on the enum `RouteType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RouteType_new" AS ENUM ('Rasa', 'WechatApp', 'Wxkf', 'Saga');
ALTER TABLE "Route" ALTER COLUMN "sourceType" TYPE "RouteType_new" USING ("sourceType"::text::"RouteType_new");
ALTER TABLE "Route" ALTER COLUMN "destinationType" TYPE "RouteType_new" USING ("destinationType"::text::"RouteType_new");
ALTER TYPE "RouteType" RENAME TO "RouteType_old";
ALTER TYPE "RouteType_new" RENAME TO "RouteType";
DROP TYPE "RouteType_old";
COMMIT;
