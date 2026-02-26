import { BadRequestException, ConflictException } from "@nestjs/common"
import { UploadController } from "./upload.controller"

describe("UploadController", () => {
  const mockInvoicesFacade: any = {
    processPdf: jest.fn(),
  }

  const mockPrismaService: any = {
    $transaction: jest.fn((cb: any) => cb({})),
  }

  let controller: UploadController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new UploadController(mockInvoicesFacade)
      // attach prismaService because the @Transactional decorator expects it
      ; (controller as any).prismaService = mockPrismaService
  })

  it("uploadPdf - fluxo feliz chama facade e retorna resultado", async () => {
    const processed = { customerNumber: "1", referenceMonth: "FEV/2024" }
    mockInvoicesFacade.processPdf.mockResolvedValueOnce(processed)

    const file = { path: "/tmp/file.pdf" } as Express.Multer.File

    const res = await controller.uploadPdf(file)

    expect(res).toEqual(processed)
    expect(mockInvoicesFacade.processPdf).toHaveBeenCalledWith(file.path)
  })

  it("uploadPdf - quando facade lança erro genérico transforma em BadRequestException", async () => {
    mockInvoicesFacade.processPdf.mockRejectedValueOnce(new Error("boom"))

    await expect(
      controller.uploadPdf({ path: "/tmp/file.pdf" } as any),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it("uploadPdf - quando facade lança ConflictException repassa a exceção", async () => {
    mockInvoicesFacade.processPdf.mockRejectedValueOnce(
      new ConflictException("already"),
    )

    await expect(
      controller.uploadPdf({ path: "/tmp/file.pdf" } as any),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
