import { ApiProperty } from "@nestjs/swagger"

export class PaginatedResponse<T> {
  @ApiProperty({
    description: "Lista de dados",
    isArray: true,
  })
  data: T[]

  @ApiProperty({
    description: "Informações de paginação",
    type: "object",
    properties: {
      total: {
        type: "number",
        description: "Total de registros no banco de dados",
        example: 50,
      },
      page: {
        type: "number",
        description: "Página atual",
        example: 1,
      },
      limit: {
        type: "number",
        description: "Limite de registros por página",
        example: 10,
      },
      totalPages: {
        type: "number",
        description: "Total de páginas",
        example: 5,
      },
    },
  })
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
