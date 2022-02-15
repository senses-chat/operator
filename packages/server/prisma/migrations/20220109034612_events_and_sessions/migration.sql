-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sourceType" "RouteType" NOT NULL,
    "sourceNamespaces" TEXT NOT NULL,
    "destinationType" "RouteType" NOT NULL,
    "destinationNamespaces" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStorage" (
    "id" SERIAL NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStorage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_sourceType_sourceNamespaces_idx" ON "Session"("sourceType", "sourceNamespaces");

-- CreateIndex
CREATE INDEX "Session_destinationType_destinationNamespaces_idx" ON "Session"("destinationType", "destinationNamespaces");

-- CreateIndex
CREATE INDEX "EventStorage_aggregateId_aggregateType_version_idx" ON "EventStorage"("aggregateId", "aggregateType", "version");

-- CreateIndex
CREATE INDEX "EventStorage_aggregateId_aggregateType_idx" ON "EventStorage"("aggregateId", "aggregateType");

-- CreateIndex
CREATE INDEX "EventStorage_aggregateId_idx" ON "EventStorage"("aggregateId");
