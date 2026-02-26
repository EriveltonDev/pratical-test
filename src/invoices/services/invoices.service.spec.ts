import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InvoicesServiceImplementation } from "./invoices.service"

describe("InvoicesServiceImplementation", () => {
  const mockLlmService = {
    extractPdfData: jest.fn(),
  }

  const mockInvoicesRepository: any = {
    findInvoice: jest.fn(),
    createInvoice: jest.fn(),
    findInvoiceByCustomerNumber: jest.fn(),
    getDashboardData: jest.fn(),
    getInvoices: jest.fn(),
  }

  let service: InvoicesServiceImplementation

  beforeEach(() => {
    jest.clearAllMocks()
    service = new InvoicesServiceImplementation(
      mockLlmService as any,
      mockInvoicesRepository as any,
    )
  })

  it("processPdf - calcula corretamente as agregações e salva no repositório", async () => {
    mockLlmService.extractPdfData.mockResolvedValueOnce({
      customerNumber: "123",
      referenceMonth: "FEV/2024",
      electricEnergy: { kwh: 100, amount: 200 },
      energySceeeWithoutIcms: { kwh: 50, amount: 75 },
      compensatedEnergyGdI: { kwh: 10, amount: -20 },
      publicLightingContribution: { amount: 5 },
    })

    mockInvoicesRepository.findInvoice.mockResolvedValueOnce(null)
    mockInvoicesRepository.createInvoice.mockResolvedValueOnce({})

    const result = await service.processPdf("/tmp/fake.pdf")

    // totalEnergyConsumptionKwh = 100 + 50 = 150
    expect(result.totalEnergyConsumptionKwh).toBeCloseTo(150)
    // compensatedEnergyKwh = 10
    expect(result.compensatedEnergyKwh).toBeCloseTo(10)
    // totalAmountWithoutGd = 200 + 75 + 5 = 280
    expect(result.totalAmountWithoutGd).toBeCloseTo(280)
    // gdSavings = abs(compensated amount) = 20
    expect(result.gdSavings).toBeCloseTo(20)

    expect(mockInvoicesRepository.createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        customerNumber: "123",
        referenceMonth: "FEV/2024",
      }),
    )
  })

  it("processPdf - lança ConflictException quando invoice já existe", async () => {
    mockLlmService.extractPdfData.mockResolvedValueOnce({
      customerNumber: "123",
      referenceMonth: "FEV/2024",
      electricEnergy: { kwh: 1, amount: 1 },
      energySceeeWithoutIcms: { kwh: 0, amount: 0 },
      compensatedEnergyGdI: { kwh: 0, amount: 0 },
      publicLightingContribution: { amount: 0 },
    })

    mockInvoicesRepository.findInvoice.mockResolvedValueOnce({ id: 1 })

    await expect(service.processPdf("/tmp/fake.pdf")).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect(mockInvoicesRepository.createInvoice).not.toHaveBeenCalled()
  })

  it("processPdf - trata falha do LLM como InternalServerErrorException", async () => {
    mockLlmService.extractPdfData.mockRejectedValueOnce(new Error("LLM down"))

    await expect(service.processPdf("/tmp/fake.pdf")).rejects.toBeInstanceOf(
      InternalServerErrorException,
    )
  })

  it("getDashboardData - retorna agregados formatados e lança NotFound quando não existe", async () => {
    mockInvoicesRepository.findInvoiceByCustomerNumber.mockResolvedValueOnce(null)

    await expect(service.getDashboardData("999")).rejects.toBeInstanceOf(
      NotFoundException,
    )

    mockInvoicesRepository.findInvoiceByCustomerNumber.mockResolvedValueOnce({ id: 1 })
    mockInvoicesRepository.getDashboardData.mockResolvedValueOnce({
      totalEnergyConsumptionKwh: 200,
      compensatedEnergyKwh: 20,
      totalAmountWithoutGd: 400.1234,
      gdSavings: -30,
    })

    const res = await service.getDashboardData("123")

    expect(res.energy.totalEnergyConsumptionKwh).toBe(200)
    expect(res.energy.compensatedEnergyKwh).toBe(20)
    // financeiro com arredondamento para 2 casas
    expect(res.financial.totalAmountWithoutGd).toBeCloseTo(400.12)
    expect(res.financial.gdSavings).toBeCloseTo(30)
  })
})
