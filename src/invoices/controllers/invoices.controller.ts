import { Controller, Get, Query } from '@nestjs/common'
import { InvoicesService } from 'src/invoices/services/invoices.service'
import { DashboardQueryDto } from '../dto/dashboard-query.dto'
import { GetInvoicesDto } from '../dto/get-invoices.dto'
import { Transactional } from 'src/shared/decorators/transaction'

@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('dashboard')
  @Transactional()
  async getDashboardData(
    @Query() query: DashboardQueryDto
  ) {
    return this.invoicesService.getDashboardData(query.customerNumber)
  }

  @Get('invoices')
  @Transactional()
  async getInvoices(
    @Query() query: GetInvoicesDto
  ) {
    return this.invoicesService.getInvoices(query)
  }
}