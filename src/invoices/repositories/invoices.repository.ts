import { Injectable } from "@nestjs/common"
import { BaseRepository } from "src/shared/infra/db/base-repository"
import { PrismaService } from "src/shared/infra/db/prisma.service"
import { CreateInvoiceDto } from "../dto/create-invoice.dto"
import { FindInvoiceDto } from "../dto/find-invoice.dto"
import { GetInvoicesDto } from "../dto/get-invoices.dto"
import { PaginatedResponse } from "src/shared/dtos/paginated-response.dto"

@Injectable()
export class InvoicesRepository extends BaseRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService)
  }

  async createInvoice(data: CreateInvoiceDto) {
    return this.prisma.rawInvoice.create({
      data: {
        customerNumber: data.customerNumber,
        referenceMonth: data.referenceMonth,
        compensatedEnergyGdIAmount: data.compensatedEnergyGdIAmount,
        compensatedEnergyGdIKwh: data.compensatedEnergyGdIKwh,
        electricEnergyAmount: data.electricEnergyAmount,
        electricEnergyKwh: data.electricEnergyKwh,
        energySceeeAmount: data.energySceeeAmount,
        energySceeeKwh: data.energySceeeKwh,
        publicLightingAmount: data.publicLightingAmount,
        processedInvoice: {
          create: {
            compensatedEnergyKwh: data.compensatedEnergyGdIKwh ?? 0,
            customerNumber: data.customerNumber,
            gdSavings: data.compensatedEnergyGdIAmount ?? 0,
            referenceMonth: data.referenceMonth,
            totalAmountWithoutGd: data.totalAmountWithoutGd ?? 0,
            totalEnergyConsumptionKwh: data.totalEnergyConsumptionKwh ?? 0
          }
        }
      }
    })
  }

  async findInvoice(data: FindInvoiceDto) {
    return await this.prisma.rawInvoice.findUnique({
      where: {
        customerNumber_referenceMonth: {
          customerNumber: data.customerNumber,
          referenceMonth: data.referenceMonth
        }
      },
    })
  }

  async getDashboardData(customerNumber: string) {
    return await this.prisma.processedInvoice.findMany({
      where: {
        customerNumber: customerNumber
      }
    })
  }
  
  async getInvoices(query: GetInvoicesDto): Promise<PaginatedResponse<any>> {
    const where: any = {}

    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const skip = (page - 1) * limit

    if (query.customerNumber) {
      where.customerNumber = query.customerNumber
    }

    if (query.referenceMonth) {
      where.referenceMonth = query.referenceMonth.toUpperCase()
    }

    const result = await this.prisma.processedInvoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await this.prisma.processedInvoice.count({ where })

    return {
      data: result,
      meta: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}