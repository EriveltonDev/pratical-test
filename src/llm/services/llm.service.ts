import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleAIFileManager } from "@google/generative-ai/server"
import fs from "fs"

import { LlmInvoiceResponse } from "../types/llm-invoice-response.type"
import { safeJsonParse } from "../utils/safe-json-parse"
import { PROMPT } from "src/llm/utils/prompt"
import { LlmService } from "../contracts/services/llm.contract"

interface RetryInfo {
  "@type": string
  retryDelay?: string
}

interface GoogleAIError {
  status?: number
  errorDetails?: Array<{ "@type": string; retryDelay?: string }>
}

@Injectable()
export class LlmServiceImplementation implements LlmService {
  private readonly genAI: GoogleGenerativeAI
  private readonly fileManager: GoogleAIFileManager
  private model = process.env.GOOGLE_AI_MODEL

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set in environment variables")
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.fileManager = new GoogleAIFileManager(apiKey)
  }

  async extractPdfData(filePath: string): Promise<LlmInvoiceResponse> {
    try {
      const uploadResponse = await this.fileManager.uploadFile(filePath, {
        mimeType: "application/pdf",
        displayName: "PDF Invoice Document",
      })

      const model = this.genAI.getGenerativeModel({
        model: this.model || "gemini-2.5-flash-lite",
      })

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: PROMPT },
      ])

      const llmData = safeJsonParse<LlmInvoiceResponse>(result.response.text())

      if (!llmData.customerNumber || !llmData.referenceMonth) {
        throw new InternalServerErrorException(
          "Required invoice identification data was not found",
        )
      }

      return llmData
    } catch (error) {
      console.log("Error in LLM processing:", error)
      if (error instanceof InternalServerErrorException) {
        throw error
      }

      if ((error as GoogleAIError)?.status === 429) {
        const delaySeconds = this.getRetryDelaySeconds(error as GoogleAIError)

        throw new InternalServerErrorException(
          `The AI service is temporarily at its request limit. ` +
            `Please try again in about ${delaySeconds} seconds.`,
        )
      }

      throw new InternalServerErrorException(
        "Error while processing PDF invoice with Gemini",
      )
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }

  private getRetryDelaySeconds(error: GoogleAIError): number {
    const retryInfo = error?.errorDetails?.find(
      (d: RetryInfo) =>
        d["@type"] === "type.googleapis.com/google.rpc.RetryInfo",
    )

    if (!retryInfo?.retryDelay) {
      return 30
    }

    return Number(retryInfo.retryDelay.replace("s", ""))
  }
}
