import { LlmInvoiceResponse } from "../../types/llm-invoice-response.type";

export abstract class LlmService {
  abstract extractPdfData(filePath: string): Promise<LlmInvoiceResponse>
}