import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class GetInvoicesDto {
  @IsOptional()
  @IsString({ message: "customerNumber must be a string" })
  customerNumber?: string

  @IsOptional()
  @IsString({ message: "referenceMonth must be a string" })
  referenceMonth?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10
}
