import { CreateInvoiceDto } from "src/invoices/dto/create-invoice.dto"
import { FindInvoiceDto } from "src/invoices/dto/find-invoice.dto"
import { GetInvoicesDto } from "src/invoices/dto/get-invoices.dto"
import { PaginatedResponse } from "src/shared/dtos/paginated-response.dto"
import { BaseRepository } from "src/shared/infra/db/base-repository"

export abstract class InvoicesRepository extends BaseRepository {
  abstract createInvoice(data: CreateInvoiceDto): Promise<any>
  abstract findInvoice(data: FindInvoiceDto): Promise<any>
  abstract getDashboardData(customerNumber: string): Promise<any>
  abstract getInvoices(query: GetInvoicesDto): Promise<PaginatedResponse<any>>
}