import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import fs from 'fs'

import { LlmInvoiceResponse } from '../types/llm-invoice-response.type'
import { safeJsonParse } from '../utils/safe-json-parse'
import { PROMPT } from 'src/llm/utils/prompt'
import { LlmService } from '../contracts/services/llm.contract'

@Injectable()
export class LlmServiceImplementation implements LlmService {
  private readonly genAI: GoogleGenerativeAI
  private readonly fileManager: GoogleAIFileManager

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not set in environment variables')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.fileManager = new GoogleAIFileManager(apiKey)
  }

  async extractPdfData(filePath: string): Promise<LlmInvoiceResponse> {
    try {
      const uploadResponse = await this.fileManager.uploadFile(filePath, {
        mimeType: 'application/pdf',
        displayName: 'PDF Invoice Document',
      })

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
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

      const llmData = safeJsonParse<LlmInvoiceResponse>(
        result.response.text(),
      )

      if (!llmData.customerNumber || !llmData.referenceMonth) {
        throw new InternalServerErrorException(
          'Required invoice identification data was not found',
        )
      }

      return llmData
    } catch (error) {
      throw error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException(
            'Error while processing PDF invoice with Gemini',
          )
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }
}