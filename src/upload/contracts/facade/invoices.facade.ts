import { ProcessedInvoiceResponseDto } from "src/invoices/dto/processed-invoice-response.dto"

export abstract class InvoicesFacade {
  abstract processPdf(filePath: string): Promise<ProcessedInvoiceResponseDto>
}
