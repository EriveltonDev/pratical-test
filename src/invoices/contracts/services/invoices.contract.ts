import { GetInvoicesDto } from "src/invoices/dto/get-invoices.dto"
import { ProcessedInvoiceResponseDto } from "src/invoices/dto/processed-invoice-response.dto"
import { DashboardResponseDto } from "src/invoices/dto/dashboard-response.dto"
import { PaginatedResponse } from "src/shared/dtos/paginated-response.dto"

export abstract class InvoicesService {
  abstract processPdf(filePath: string): Promise<ProcessedInvoiceResponseDto>
  abstract getDashboardData(
    customerNumber: string,
  ): Promise<DashboardResponseDto>
  abstract getInvoices(
    query: GetInvoicesDto,
  ): Promise<PaginatedResponse<ProcessedInvoiceResponseDto>>
}
