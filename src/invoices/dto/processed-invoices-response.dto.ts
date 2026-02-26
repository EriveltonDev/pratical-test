export interface ProcessedInvoiceRecordDto {
  id: string
  createdAt: Date

  customerNumber: string
  referenceMonth: string

  totalEnergyConsumptionKwh: number
  compensatedEnergyKwh: number
  totalAmountWithoutGd: number
  gdSavings: number

  rawInvoiceId: string
}
