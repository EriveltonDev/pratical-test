import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
const request = require("supertest")
import { AppModule } from "../src/shared/module/app.module"
import { PrismaService } from "../src/shared/infra/db/prisma.service"

describe("Upload e2e", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ $transaction: jest.fn((cb: any) => cb({})) })
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it("rejects non-PDF upload with 400", async () => {
    await request(app.getHttpServer())
      .post("/upload/invoice-pdf")
      .attach("file", Buffer.from("not a pdf"), "file.txt")
      .expect(400)
  })
})
