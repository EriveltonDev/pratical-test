import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { InvoicesService } from 'src/invoices/contracts/services/invoices.contract'
import { Transactional } from 'src/shared/decorators/transaction'

@Controller('upload')
export class UploadController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('invoice-pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp',
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        const isPdf =
          file.mimetype === 'application/pdf' &&
          extname(file.originalname).toLowerCase() === '.pdf'

        if (!isPdf) {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          )
        }

        cb(null, true)
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  @Transactional()
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    try {
      return this.invoicesService.processPdf(file.path)
    } catch (error) {
      console.log('Error processing PDF:', error)
      throw new BadRequestException('Failed to process PDF file')
    }
  }
}