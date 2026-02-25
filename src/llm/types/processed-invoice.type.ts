export interface ProcessedInvoice {
  customerNumber: string
  referenceMonth: string

  totalEnergyConsumptionKwh: number
  compensatedEnergyKwh: number

  totalAmountWithoutGd: number
  gdSavings: number
}