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
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiOperation } from "@nestjs/swagger"
import { Transactional } from "src/shared/decorators/transaction"
import { InvoicesFacade } from "../contracts/facade/invoices.facade"

@Controller("upload")
@ApiTags("Upload")
export class UploadController {
  constructor(private readonly invoicesFacade: InvoicesFacade) { }

  @Post("invoice-pdf")
  @ApiOperation({ summary: "Upload de arquivo PDF de fatura para processamento" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Arquivo PDF da fatura",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Fatura processada com sucesso",
    schema: {
      example: {
        customerNumber: "123456",
        referenceMonth: "2026-02",
        totalEnergyConsumptionKwh: 470.8,
        compensatedEnergyKwh: 50.0,
        totalAmountWithoutGd: 713.2,
        gdSavings: 75.0,
      },
    },
  })
  @ApiResponse({ status: 400, description: "Arquivo inválido ou erro ao processar" })
  @ApiResponse({ status: 409, description: "Fatura já existe para este cliente e mês" })
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
