-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('Rasa', 'WechatApp', 'Wechaty', 'Saga');

-- CreateTable
CREATE TABLE "RasaHelperServer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "dockerOptions" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" INTEGER,

    CONSTRAINT "RasaHelperServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RasaServer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "dockerOptions" JSONB,
    "host" VARCHAR,
    "port" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RasaServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "sourceType" "RouteType" NOT NULL,
    "sourceName" VARCHAR NOT NULL,
    "destinationType" "RouteType" NOT NULL,
    "destinationName" VARCHAR NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WechatApp" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "appId" VARCHAR NOT NULL,
    "appSecret" VARCHAR NOT NULL,
    "token" VARCHAR,
    "aesKey" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WechatApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RasaServer_name_key" ON "RasaServer"("name");

-- CreateIndex
CREATE INDEX "Route_destinationName_idx" ON "Route"("destinationName");

-- CreateIndex
CREATE INDEX "Route_sourceName_idx" ON "Route"("sourceName");

-- CreateIndex
CREATE INDEX "Route_isActive_idx" ON "Route"("isActive");

-- CreateIndex
CREATE INDEX "Route_sourceType_idx" ON "Route"("sourceType");

-- CreateIndex
CREATE INDEX "Route_destinationType_idx" ON "Route"("destinationType");

-- CreateIndex
CREATE UNIQUE INDEX "Route_sourceType_sourceName_destinationType_destinationName_key" ON "Route"("sourceType", "sourceName", "destinationType", "destinationName");

-- CreateIndex
CREATE UNIQUE INDEX "WechatApp_name_key" ON "WechatApp"("name");

-- AddForeignKey
ALTER TABLE "RasaHelperServer" ADD CONSTRAINT "RasaHelperServer_botId_fkey" FOREIGN KEY ("botId") REFERENCES "RasaServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
