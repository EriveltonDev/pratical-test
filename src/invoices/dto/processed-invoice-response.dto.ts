import { ApiProperty } from "@nestjs/swagger"

export class ProcessedInvoiceResponseDto {
  @ApiProperty({
    description: "Número único do cliente",
    example: "123456",
  })
  customerNumber: string

  @ApiProperty({
    description: "Mês de referência da fatura (YYYY-MM)",
    example: "2026-02",
  })
  referenceMonth: string

  @ApiProperty({
    description: "Consumo total de energia em kWh",
    example: 470.8,
  })
  totalEnergyConsumptionKwh: number

  @ApiProperty({
    description: "Energia compensada por geração distribuída (GDI) em kWh",
    example: 50.0,
  })
  compensatedEnergyKwh: number

  @ApiProperty({
    description: "Valor total da fatura sem desconto de GDI em reais",
    example: 713.2,
  })
  totalAmountWithoutGd: number

  @ApiProperty({
    description: "Economia obtida com geração distribuída em reais",
    example: 75.0,
  })
  gdSavings: number
}
