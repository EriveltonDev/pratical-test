import { PrismaService } from "./prisma.service"
import { TransactionManager } from "./transaction-context"

export abstract class BaseRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  protected get prisma() {
    const context = TransactionManager.getContext()
    return context?.tx ?? this.prismaService
  }
}
