import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/upload.controller';
import { InvoicesModule } from 'src/invoices/module/invoices.module';

@Module({
  imports: [InvoicesModule],
  providers: [],
  controllers: [UploadController],
  exports: [],
})
export class UploadModule {}