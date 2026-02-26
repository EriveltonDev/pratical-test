import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class GetInvoicesDto {
  @ApiProperty({
    description: "Filtro opcional: número do cliente",
    example: "123456",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "customerNumber must be a string" })
  customerNumber?: string

  @ApiProperty({
    description: "Filtro opcional: mês de referência (e.g., FEV/2024)",
    example: "FEV/2024",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "referenceMonth must be a string" })
  referenceMonth?: string

  @ApiProperty({
    description: "Número da página (padrão: 1)",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiProperty({
    description: "Quantidade de registros por página (padrão: 10, máximo: 100)",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}
