export interface RawInvoiceRecordDto {
  id: string
  createdAt: Date

  customerNumber: string
  referenceMonth: string

  electricEnergyKwh: number | null
  electricEnergyAmount: number | null

  energySceeeKwh: number | null
  energySceeeAmount: number | null

  compensatedEnergyGdIKwh: number | null
  compensatedEnergyGdIAmount: number | null

  publicLightingAmount: number | null
}
