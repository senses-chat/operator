-- CreateTable
CREATE TABLE "KeyValueStorage" (
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "KeyValueStorage_namespace_idx" ON "KeyValueStorage"("namespace");

-- CreateIndex
CREATE INDEX "KeyValueStorage_namespace_key_idx" ON "KeyValueStorage"("namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "KeyValueStorage_namespace_key_key" ON "KeyValueStorage"("namespace", "key");
