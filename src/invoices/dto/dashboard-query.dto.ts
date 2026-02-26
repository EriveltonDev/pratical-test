import { IsString, Length } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class DashboardQueryDto {
  @ApiProperty({
    description: "Número único do cliente",
    example: "123456",
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: "customerNumber is required and must be a string" })
  @Length(3, 20, {
    message: "customerNumber must be between 3 and 20 characters",
  })
  customerNumber: string
}
