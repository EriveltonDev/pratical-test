import { Module } from "@nestjs/common"
import { InvoicesServiceImplementation } from "../services/invoices.service"
import { LlmModule } from "src/llm/module/llm.module"
import { PrismaModule } from "src/shared/infra/db/module/prisma.module"
import { InvoicesRepositoryImplementation } from "../repositories/invoices.repository"
import { InvoicesController } from "../controllers/invoices.controller"
import { InvoicesRepository } from "../contracts/repositories/invoices.contract"
import { InvoicesService } from "../contracts/services/invoices.contract"

@Module({
  imports: [LlmModule, PrismaModule],
  controllers: [InvoicesController],
  providers: [
    {
      provide: InvoicesService,
      useClass: InvoicesServiceImplementation,
    },
    {
      provide: InvoicesRepository,
      useClass: InvoicesRepositoryImplementation,
    },
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}
