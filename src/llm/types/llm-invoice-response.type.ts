export interface LlmInvoiceResponse {
  customerNumber: string | null
  referenceMonth: string | null

  electricEnergy: {
    kwh: number | null
    amount: number | null
  }

  energySceeeWithoutIcms: {
    kwh: number | null
    amount: number | null
  }

  compensatedEnergyGdI: {
    kwh: number | null
    amount: number | null
  }

  publicLightingContribution: {
    amount: number | null
  }
}