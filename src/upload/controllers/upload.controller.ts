import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import { Transactional } from "src/shared/decorators/transaction"
import { InvoicesFacade } from "../contracts/facade/invoices.facade"

@Controller("upload")
export class UploadController {
  constructor(private readonly invoicesFacade: InvoicesFacade) { }

  @Post("invoice-pdf")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./tmp",
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        const isPdf =
          file.mimetype === "application/pdf" &&
          extname(file.originalname).toLowerCase() === ".pdf"

        if (!isPdf) {
          return cb(
            new BadRequestException("Only PDF files are allowed"),
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
      return await this.invoicesFacade.processPdf(file.path)
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }

      throw new BadRequestException("Failed to process PDF file")
    }
  }
}
