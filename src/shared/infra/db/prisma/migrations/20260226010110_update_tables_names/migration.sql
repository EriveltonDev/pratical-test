/*
  Warnings:

  - You are about to drop the `ProcessedInvoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RawInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcessedInvoice" DROP CONSTRAINT "ProcessedInvoice_rawInvoiceId_fkey";

-- DropTable
DROP TABLE "ProcessedInvoice";

-- DropTable
DROP TABLE "RawInvoice";

-- CreateTable
CREATE TABLE "raw_invoices" (
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

    CONSTRAINT "raw_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_invoices" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "totalEnergyConsumptionKwh" DOUBLE PRECISION NOT NULL,
    "compensatedEnergyKwh" DOUBLE PRECISION NOT NULL,
    "totalAmountWithoutGd" DOUBLE PRECISION NOT NULL,
    "gdSavings" DOUBLE PRECISION NOT NULL,
    "rawInvoiceId" TEXT NOT NULL,

    CONSTRAINT "processed_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_invoices_customerNumber_idx" ON "raw_invoices"("customerNumber");

-- CreateIndex
CREATE INDEX "raw_invoices_referenceMonth_idx" ON "raw_invoices"("referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "raw_invoices_customerNumber_referenceMonth_key" ON "raw_invoices"("customerNumber", "referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "processed_invoices_rawInvoiceId_key" ON "processed_invoices"("rawInvoiceId");

-- CreateIndex
CREATE INDEX "processed_invoices_customerNumber_idx" ON "processed_invoices"("customerNumber");

-- CreateIndex
CREATE INDEX "processed_invoices_referenceMonth_idx" ON "processed_invoices"("referenceMonth");

-- AddForeignKey
ALTER TABLE "processed_invoices" ADD CONSTRAINT "processed_invoices_rawInvoiceId_fkey" FOREIGN KEY ("rawInvoiceId") REFERENCES "raw_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
