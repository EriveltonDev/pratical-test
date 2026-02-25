import { Inject } from "@nestjs/common"
import { TransactionManager } from "../infra/db/transaction-context"
import { PrismaService } from "../infra/db/prisma.service"

export function Transactional({ timeout = 300000, isolationLevel = undefined }:{ timeout?: number, isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable' } = {}) {
  const injectPrisma = Inject(PrismaService)
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    injectPrisma(target, 'prismaService')

    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const prismaService: PrismaService = (this as any).prismaService

      if (!prismaService) {
        throw new Error('PrismaService not found in Transactional method. Make sure to inject it properly.')
      }

      return prismaService.$transaction(async (tx) => {
        return TransactionManager.run({ tx }, () => {
          return originalMethod.apply(this, args)
        })
      }, {
        timeout: timeout, // 5 minutes
        isolationLevel
      })
    }

    return descriptor
  }
}