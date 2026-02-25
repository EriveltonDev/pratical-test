import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import fs from 'fs'
import { LlmService } from 'src/llm/services/llm.service'
import { ProcessedInvoice } from 'src/llm/types/processed-invoice.type'
import { InvoicesRepository } from '../repositories/invoices.repository'
import { GetInvoicesDto } from '../dto/get-invoices.dto'

@Injectable()
export class InvoicesService {
  constructor(
    private readonly llmService: LlmService,
    private readonly invoicesRepository: InvoicesRepository
  ) {}

  async processPdf(filePath: string): Promise<ProcessedInvoice> {
    try {
      const llmData = await this.llmService.extractPdfData(filePath)

      const alreadyExists = await this.invoicesRepository.findInvoice({
        customerNumber: llmData.customerNumber as string,
        referenceMonth: llmData.referenceMonth as string,
      })

      if (alreadyExists) {
        throw new ConflictException(
          'Invoice for this customer and reference month already exists',
        )
      }

      const totalEnergyConsumptionKwh =
        (llmData.electricEnergy.kwh ?? 0) +
        (llmData.energySceeeWithoutIcms.kwh ?? 0)

      const compensatedEnergyKwh =
        llmData.compensatedEnergyGdI.kwh ?? 0

      const totalAmountWithoutGd =
        (llmData.electricEnergy.amount ?? 0) +
        (llmData.energySceeeWithoutIcms.amount ?? 0) +
        (llmData.publicLightingContribution.amount ?? 0)

      const gdSavings = Math.abs(
        llmData.compensatedEnergyGdI.amount ?? 0,
      )

      const processedInvoice: ProcessedInvoice = {
        customerNumber: llmData.customerNumber as string,
        referenceMonth: llmData.referenceMonth as string,

        totalEnergyConsumptionKwh,
        compensatedEnergyKwh,

        totalAmountWithoutGd,
        gdSavings,
      }

      await this.invoicesRepository.createInvoice({
        customerNumber: processedInvoice.customerNumber,
        referenceMonth: processedInvoice.referenceMonth,
        compensatedEnergyGdIAmount: llmData.compensatedEnergyGdI.amount ?? 0,
        compensatedEnergyGdIKwh: compensatedEnergyKwh,
        electricEnergyAmount: llmData.electricEnergy.amount ?? 0,
        electricEnergyKwh: llmData.electricEnergy.kwh ?? 0,
        energySceeeAmount: llmData.energySceeeWithoutIcms.amount ?? 0,
        energySceeeKwh: llmData.energySceeeWithoutIcms.kwh ?? 0,
        publicLightingAmount: llmData.publicLightingContribution.amount ?? 0,
        totalAmountWithoutGd,
        totalEnergyConsumptionKwh
      })

      return processedInvoice
    } catch (error) {
      console.log('Error processing PDF invoice:', error)
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error
      }

      throw new InternalServerErrorException(
        'Error while processing PDF invoice with Gemini',
      )
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }

  async getDashboardData(customerNumber: string) {
    const invoices = await this.invoicesRepository.getDashboardData(customerNumber)
    
    const energy = invoices.reduce(
      (acc, inv) => ({
        totalEnergyConsumptionKwh: acc.totalEnergyConsumptionKwh + inv.totalEnergyConsumptionKwh,
        compensatedEnergyKwh: acc.compensatedEnergyKwh + inv.compensatedEnergyKwh,
      }),
      { totalEnergyConsumptionKwh: 0, compensatedEnergyKwh: 0 },
    )

    const financial = invoices.reduce(
      (acc, inv) => ({
        totalAmountWithoutGd: parseFloat((acc.totalAmountWithoutGd + inv.totalAmountWithoutGd).toFixed(2)),
        gdSavings: parseFloat((acc.gdSavings + Math.abs(inv.gdSavings)).toFixed(2)),
      }),
      { totalAmountWithoutGd: 0, gdSavings: 0 },
    )

    return { energy, financial }
  }

  async getInvoices(query: GetInvoicesDto) {
    return this.invoicesRepository.getInvoices(query)
  }
}