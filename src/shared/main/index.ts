import { NestFactory } from "@nestjs/core"
import { AppModule } from "../module/app.module"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle("Lumi Invoices API")
    .setDescription("API para upload e consulta de faturas processadas via LLM")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("/api/docs", app, document)

  const port = process.env.PORT ?? 3000
  await app.listen(port, '0.0.0.0')

  console.log(`🚀 Server running on port ${port}`)
}

void bootstrap()