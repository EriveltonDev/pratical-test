import { Inject } from "@nestjs/common"
import { TransactionManager } from "../infra/db/transaction-context"
import { PrismaService } from "../infra/db/prisma.service"

export function Transactional<T = any>({
  timeout = 300000,
  isolationLevel = undefined,
}: {
  timeout?: number
  isolationLevel?:
    | "ReadUncommitted"
    | "ReadCommitted"
    | "RepeatableRead"
    | "Serializable"
} = {}) {
  const injectPrisma = Inject(PrismaService)

  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    injectPrisma(target, "prismaService")

    const originalMethod = descriptor.value as (
      ...args: any[]
    ) => Promise<T> | T

    descriptor.value = async function (
      this: { prismaService: PrismaService },
      ...args: any[]
    ): Promise<T> {
      const prismaService: PrismaService = this.prismaService

      if (!prismaService) {
        throw new Error(
          "PrismaService not found in Transactional method. Make sure to inject it properly.",
        )
      }

      return await prismaService.$transaction(
        async (tx) => {
          return await TransactionManager.run({ tx }, () => {
            return originalMethod.apply(this, args) as Promise<T>
          })
        },
        {
          timeout: timeout, // 5 minutes
          isolationLevel,
        },
      )
    }

    return descriptor
  }
}
