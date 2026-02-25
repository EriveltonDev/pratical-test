import { GetInvoicesDto } from "src/invoices/dto/get-invoices.dto";

export abstract class InvoicesService {
  abstract processPdf(filePath: string): Promise<any>
  abstract getDashboardData(customerNumber: string): Promise<any>
  abstract getInvoices(query: GetInvoicesDto): Promise<any>
}