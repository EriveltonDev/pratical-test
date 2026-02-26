export class CreateInvoiceDto {
  customerNumber: string
  referenceMonth: string

  electricEnergyKwh?: number
  electricEnergyAmount?: number

  energySceeeKwh?: number
  energySceeeAmount?: number

  compensatedEnergyGdIKwh?: number
  compensatedEnergyGdIAmount?: number

  publicLightingAmount?: number

  totalEnergyConsumptionKwh?: number
  compensatedEnergyKwh?: number
  totalAmountWithoutGd?: number
  gdSavings?: number
}
