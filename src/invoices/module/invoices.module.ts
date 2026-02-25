import { Module } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { LlmModule } from 'src/llm/module/llm.module';
import { PrismaModule } from 'src/shared/infra/db/module/prisma.module';
import { InvoicesRepository } from '../repositories/invoices.repository';
import { InvoicesController } from '../controllers/invoices.controller';

@Module({
  imports: [
    LlmModule,
    PrismaModule
  ],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoicesRepository
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}