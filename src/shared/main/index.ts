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

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
