-- CreateTable
CREATE TABLE "RawInvoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "electricEnergyKwh" DOUBLE PRECISION,
    "electricEnergyAmount" DOUBLE PRECISION,
    "energySceeeKwh" DOUBLE PRECISION,
    "energySceeeAmount" DOUBLE PRECISION,
    "compensatedEnergyGdIKwh" DOUBLE PRECISION,
    "compensatedEnergyGdIAmount" DOUBLE PRECISION,
    "publicLightingAmount" DOUBLE PRECISION,

    CONSTRAINT "RawInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedInvoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "totalEnergyConsumptionKwh" DOUBLE PRECISION NOT NULL,
    "compensatedEnergyKwh" DOUBLE PRECISION NOT NULL,
    "totalAmountWithoutGd" DOUBLE PRECISION NOT NULL,
    "gdSavings" DOUBLE PRECISION NOT NULL,
    "rawInvoiceId" TEXT NOT NULL,

    CONSTRAINT "ProcessedInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawInvoice_customerNumber_idx" ON "RawInvoice"("customerNumber");

-- CreateIndex
CREATE INDEX "RawInvoice_referenceMonth_idx" ON "RawInvoice"("referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "RawInvoice_customerNumber_referenceMonth_key" ON "RawInvoice"("customerNumber", "referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedInvoice_rawInvoiceId_key" ON "ProcessedInvoice"("rawInvoiceId");

-- CreateIndex
CREATE INDEX "ProcessedInvoice_customerNumber_idx" ON "ProcessedInvoice"("customerNumber");

-- CreateIndex
CREATE INDEX "ProcessedInvoice_referenceMonth_idx" ON "ProcessedInvoice"("referenceMonth");

-- AddForeignKey
ALTER TABLE "ProcessedInvoice" ADD CONSTRAINT "ProcessedInvoice_rawInvoiceId_fkey" FOREIGN KEY ("rawInvoiceId") REFERENCES "RawInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
