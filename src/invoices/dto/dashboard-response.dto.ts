export class DashboardResponseDto {
  energy: {
    totalEnergyConsumptionKwh: number
    compensatedEnergyKwh: number
  }

  financial: {
    totalAmountWithoutGd: number
    gdSavings: number
  }
}
