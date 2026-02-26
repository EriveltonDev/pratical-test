import { ApiProperty } from "@nestjs/swagger"

export class DashboardResponseDto {
  @ApiProperty({
    description: "Dados de consumo de energia",
    type: "object",
    properties: {
      totalEnergyConsumptionKwh: {
        type: "number",
        description: "Consumo total de energia em kWh",
        example: 470.8,
      },
      compensatedEnergyKwh: {
        type: "number",
        description: "Energia compensada por GDI em kWh",
        example: 50.0,
      },
    },
  })
  energy: {
    totalEnergyConsumptionKwh: number
    compensatedEnergyKwh: number
  }

  @ApiProperty({
    description: "Dados financeiros",
    type: "object",
    properties: {
      totalAmountWithoutGd: {
        type: "number",
        description: "Valor total sem desconto de GDI em reais",
        example: 713.2,
      },
      gdSavings: {
        type: "number",
        description: "Economia obtida com GDI em reais",
        example: 75.0,
      },
    },
  })
  financial: {
    totalAmountWithoutGd: number
    gdSavings: number
  }
}
