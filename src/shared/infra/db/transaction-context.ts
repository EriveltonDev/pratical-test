import { AsyncLocalStorage } from "async_hooks"
import { PrismaClient } from "src/shared/infra/db/prisma/generated/prisma/client"

export interface TransactionContext {
  tx: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
}

export class TransactionManager {
  private static asyncLocalStorage = new AsyncLocalStorage<TransactionContext>()

  static getContext(): TransactionContext | undefined {
    return this.asyncLocalStorage.getStore()
  }

  static run<T>(context: TransactionContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback)
  }
}
