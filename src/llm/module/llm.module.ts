import { Module } from "@nestjs/common"
import { LlmServiceImplementation } from "../services/llm.service"
import { LlmService } from "src/invoices/contracts/services/llm.contract"

@Module({
  providers: [
    {
      provide: LlmService,
      useClass: LlmServiceImplementation,
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
