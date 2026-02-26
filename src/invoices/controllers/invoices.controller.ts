import { Controller, Get, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import { DashboardQueryDto } from "../dto/dashboard-query.dto"
import { GetInvoicesDto } from "../dto/get-invoices.dto"
import { Transactional } from "src/shared/decorators/transaction"
import { InvoicesService } from "../contracts/services/invoices.contract"

@Controller()
@ApiTags("Invoices")
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Get("dashboard")
  @ApiOperation({ summary: "Obter dados agregados de faturas para um cliente" })
  @ApiQuery({
    name: "customerNumber",
    required: true,
    description: "Número do cliente",
    example: "123456",
  })
  @ApiResponse({
    status: 200,
    description: "Dados do dashboard do cliente",
    schema: {
      example: {
        energy: {
          totalEnergyConsumptionKwh: 470.8,
          compensatedEnergyKwh: 50.0,
        },
        financial: {
          totalAmountWithoutGd: 713.2,
          gdSavings: 75.0,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Nenhuma fatura encontrada para esse cliente" })
  @Transactional()
  async getDashboardData(@Query() query: DashboardQueryDto) {
    return await this.invoicesService.getDashboardData(query.customerNumber)
  }

  @Get("invoices")
  @ApiOperation({ summary: "Listar faturas processadas com paginação" })
  @ApiQuery({
    name: "customerNumber",
    required: false,
    description: "Filtro por número do cliente",
    example: "123456",
  })
  @ApiQuery({
    name: "referenceMonth",
    required: false,
    description: "Filtro por mês de referência (e.g., 2026-02)",
    example: "2026-02",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Número da página (padrão: 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Quantidade de registros por página (padrão: 10)",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de faturas",
    schema: {
      example: {
        data: [
          {
            customerNumber: "123456",
            referenceMonth: "2026-02",
            totalEnergyConsumptionKwh: 470.8,
            compensatedEnergyKwh: 50.0,
            totalAmountWithoutGd: 713.2,
            gdSavings: 75.0,
            createdAt: "2026-02-26T18:40:00Z",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @Transactional()
  async getInvoices(@Query() query: GetInvoicesDto) {
    return await this.invoicesService.getInvoices(query)
  }
}
