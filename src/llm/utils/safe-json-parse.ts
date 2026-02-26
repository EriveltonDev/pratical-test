import { InternalServerErrorException } from "@nestjs/common"

export function safeJsonParse<T>(text: string): T {
  try {
    const sanitized = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    return JSON.parse(sanitized) as T
  } catch {
    throw new InternalServerErrorException(
      "Invalid response from LLM (malformed JSON)",
    )
  }
}
