/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "SessionStorage" (
    "id" TEXT NOT NULL,
    "sourceType" "RouteType" NOT NULL,
    "sourceNamespaces" TEXT NOT NULL,
    "destinationType" "RouteType" NOT NULL,
    "destinationNamespaces" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionStorage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionStorage_sourceType_sourceNamespaces_idx" ON "SessionStorage"("sourceType", "sourceNamespaces");

-- CreateIndex
CREATE INDEX "SessionStorage_destinationType_destinationNamespaces_idx" ON "SessionStorage"("destinationType", "destinationNamespaces");
