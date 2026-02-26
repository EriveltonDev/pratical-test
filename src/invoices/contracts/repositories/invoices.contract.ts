import { CreateInvoiceDto } from "src/invoices/dto/create-invoice.dto"
import { FindInvoiceDto } from "src/invoices/dto/find-invoice.dto"
import { GetInvoicesDto } from "src/invoices/dto/get-invoices.dto"
import { PaginatedResponse } from "src/shared/dtos/paginated-response.dto"
import { BaseRepository } from "src/shared/infra/db/base-repository"
import { RawInvoiceRecordDto } from "src/invoices/dto/invoice-record-response.dto"
import { DashboardAggregateRecordDto } from "src/invoices/dto/dashboard-invoices.dto"
import { ProcessedInvoiceRecordDto } from "src/invoices/dto/processed-invoices-response.dto"

export abstract class InvoicesRepository extends BaseRepository {
  abstract createInvoice(data: CreateInvoiceDto): Promise<RawInvoiceRecordDto>
  abstract findInvoice(
    data: FindInvoiceDto,
  ): Promise<RawInvoiceRecordDto | null>
  abstract getDashboardData(
    customerNumber: string,
  ): Promise<DashboardAggregateRecordDto>
  abstract getInvoices(
    query: GetInvoicesDto,
  ): Promise<PaginatedResponse<ProcessedInvoiceRecordDto>>
  abstract findInvoiceByCustomerNumber(customerNumber: string): Promise<RawInvoiceRecordDto | null>
}
