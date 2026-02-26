import { Injectable } from "@nestjs/common";
import { InvoicesFacade } from "src/upload/contracts/facade/invoices.facade";
import { InvoicesService } from "../contracts/services/invoices.contract";
import { ProcessedInvoiceResponseDto } from "../dto/processed-invoice-response.dto";

@Injectable()
export class InvoicesFacadeImplementation implements InvoicesFacade {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) { }

  async processPdf(filePath: string): Promise<ProcessedInvoiceResponseDto> {
    return await this.invoicesService.processPdf(filePath)
  }
}