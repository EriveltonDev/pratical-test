import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common"
import fs from "fs"
import { ProcessedInvoice } from "src/llm/types/processed-invoice.type"
import { ProcessedInvoiceResponseDto } from "../dto/processed-invoice-response.dto"
import { DashboardResponseDto } from "../dto/dashboard-response.dto"
import { GetInvoicesDto } from "../dto/get-invoices.dto"
import { PaginatedResponse } from "src/shared/dtos/paginated-response.dto"
import { InvoicesRepository } from "../contracts/repositories/invoices.contract"
import { InvoicesService } from "../contracts/services/invoices.contract"
import { LlmService } from "../contracts/services/llm.contract"

@Injectable()
export class InvoicesServiceImplementation implements InvoicesService {
  constructor(
    private readonly llmService: LlmService,
    private readonly invoicesRepository: InvoicesRepository,
  ) { }

  async processPdf(filePath: string): Promise<ProcessedInvoiceResponseDto> {
    try {
      const llmData = await this.llmService.extractPdfData(filePath)

      const alreadyExists = await this.invoicesRepository.findInvoice({
        customerNumber: llmData.customerNumber as string,
        referenceMonth: llmData.referenceMonth as string,
      })

      if (alreadyExists) {
        throw new ConflictException(
          "Invoice for this customer and reference month already exists",
        )
      }

      const totalEnergyConsumptionKwh =
        (llmData.electricEnergy.kwh ?? 0) +
        (llmData.energySceeeWithoutIcms.kwh ?? 0)

      const compensatedEnergyKwh = llmData.compensatedEnergyGdI.kwh ?? 0

      const totalAmountWithoutGd =
        (llmData.electricEnergy.amount ?? 0) +
        (llmData.energySceeeWithoutIcms.amount ?? 0) +
        (llmData.publicLightingContribution.amount ?? 0)

      const gdSavings = Math.abs(llmData.compensatedEnergyGdI.amount ?? 0)

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
        totalEnergyConsumptionKwh,
      })

      return processedInvoice
    } catch (error) {
      console.log("Error processing PDF invoice:", error)
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error
      }

      throw new InternalServerErrorException(
        "Error while processing PDF invoice with Gemini",
      )
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }

  async getDashboardData(
    customerNumber: string,
  ): Promise<DashboardResponseDto> {
    const hasInvoice = await this.invoicesRepository.findInvoiceByCustomerNumber(customerNumber)

    if (!hasInvoice) {
      throw new NotFoundException("No invoices found for this customer")
    }

    const agg = await this.invoicesRepository.getDashboardData(customerNumber)

    return {
      energy: {
        totalEnergyConsumptionKwh: agg.totalEnergyConsumptionKwh,
        compensatedEnergyKwh: agg.compensatedEnergyKwh,
      },
      financial: {
        totalAmountWithoutGd: Number(agg.totalAmountWithoutGd.toFixed(2)),
        gdSavings: Number(Math.abs(agg.gdSavings).toFixed(2)),
      },
    }
  }

  async getInvoices(
    query: GetInvoicesDto,
  ): Promise<PaginatedResponse<ProcessedInvoiceResponseDto>> {
    return this.invoicesRepository.getInvoices(query)
  }
}
