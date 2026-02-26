# Lumi Invoices API

Aplicação backend para processar faturas de energia elétrica com IA, extrair dados via PDF e calcular métricas de consumo e economia com geração distribuída (GDI).

---

## 🚀 Quick Start (Docker - Recomendado)

```bash
npm run docker:rebuild
```

Isso faz tudo automaticamente:
- ✅ Sobe PostgreSQL
- ✅ Instala dependências 
- ✅ Executa migrations
- ✅ Inicia servidor em modo watch

**Acesse a API**: http://localhost:3000/api/docs (Swagger)

---

## 🖥️ Execução Local (sem Docker)

```bash
# Instale dependências
npm install

# Certifique-se que PostgreSQL está rodando localmente
# DATABASE_URL deve apontar para: postgresql://postgres:postgres@localhost:5432/app_db

# Execute migrations
npx prisma migrate deploy

# Inicie servidor
npm run start:dev
```

---

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologia | Justificativa |
|-----------|-----------|--------------|
| **Framework** | NestJS 11.x | Injeção de dependência nativa, decoradores TypeScript, testes e Swagger integrados |
| **Banco de Dados** | PostgreSQL 18 + Prisma 7.x | ORM type-safe, migrations versionadas, transações nativas |
| **IA / LLM** | Google Generative AI (Gemini 2.0 Flash) | Análise nativa de PDFs, baixa latência, token-efficient |
| **Linguagem** | TypeScript 5.x | Tipagem estática end-to-end, previne erros em tempo de compilação |
| **Testes** | Jest + Supertest | Framework com zero config, mocks isolados, cobertura |
| **Documentação** | Swagger / OpenAPI 3.0 | Documentação interativa, "Try it out" direto no navegador |
| **Containerização** | Docker + Docker Compose | Reproduzibilidade, isolamento de ambiente |

---

## 🏛️ Decisões Arquiteturais

### 1. **Arquitetura em Camadas (Onion/Clean)**

```
Controller (HTTP)
    ↓
Service (Negócio)
    ↓
Repository (Abstração BD)
    ↓
Prisma ORM
    ↓
PostgreSQL
```

**Benefício**: Testes isolados por camada, fácil manutenção

### 2. **Inversão de Dependência via Contratos**

Cada camada define um contrato abstrato, a implementação é injetada:

```typescript
// Contrato
export abstract class InvoicesRepository { ... }

// Implementação
export class InvoicesRepositoryImplementation extends InvoicesRepository { ... }

// DI Token
@Module({
  providers: [{ provide: InvoicesRepository, useClass: InvoicesRepositoryImplementation }]
})
```

**Benefício**: Testes unitários só mockam o contrato, sem tocar BD real

### 3. **Decorator `@Transactional()` Customizado**

```typescript
@Get('invoices')
@Transactional()  // Automático!
async getInvoices(@Query() query: GetInvoicesDto) { ... }
```

Usa `AsyncLocalStorage` para contexto thread-safe. Sem repetição de código.

### 4. **Facade Pattern para Orquestração**

Upload module delega ao `InvoicesFacade` → `InvoicesService` → `InvoicesRepository`

**Benefício**: Separação clara entre orquestração e lógica de negócio

### 5. **DTOs com Validação Automática**

```typescript
@Get('dashboard')
async getDashboardData(@Query() query: DashboardQueryDto) { ... }
```

`ValidationPipe` valida contra schema antes de chegar ao handler → retorna 400 se inválido

---

## 📦 Requisitos

- **Node.js**: v20+ (recomendado v22+)
- **Docker & Docker Compose**: para execução containerizada (recomendado)
- **PostgreSQL 16+**: se rodar localmente sem Docker
- **npm**: v10+

---

## 🔧 Variáveis de Ambiente

Crie `.env` na raiz (ou use os padrões do docker-compose):

```bash
# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"

# Servidor
PORT=3000

# LLM - Google Generative AI (opcional, para IA real)
GOOGLE_AI_API_KEY="sua-chave-aqui"
GOOGLE_AI_MODEL="gemini-2.0-flash-lite"

# Ambiente
NODE_ENV=development
```

Obtenha chave de IA em: https://aistudio.google.com/apikey

---

## 📚 API - Endpoints

### 1. **Upload de Fatura - POST**

```
POST /upload/invoice-pdf
Content-Type: multipart/form-data

Parâmetros:
  - file (obrigatório): arquivo PDF

Respostas:
  201 Created:   { customerNumber, referenceMonth, totalEnergyConsumptionKwh, compensatedEnergyKwh, totalAmountWithoutGd, gdSavings }
  400 Bad Request: arquivo inválido ou erro ao processar
  409 Conflict:   fatura já existe para este cliente/mês
```

**Exemplo cURL**:
```bash
curl -X POST http://localhost:3000/upload/invoice-pdf \
  -F "file=@invoice.pdf"
```

### 2. **Dashboard de Cliente - GET**

```
GET /dashboard?customerNumber=123456

Parâmetros:
  - customerNumber (obrigatório): número do cliente

Respostas:
  200 OK:     { energy: { totalEnergyConsumptionKwh, compensatedEnergyKwh }, financial: { totalAmountWithoutGd, gdSavings } }
  404 Not Found: cliente não possui faturas
```

**Exemplo cURL**:
```bash
curl http://localhost:3000/dashboard?customerNumber=123456
```

### 3. **Listar Faturas - GET**

```
GET /invoices?customerNumber=123456&referenceMonth=2026-02&page=1&limit=10

Parâmetros (todos opcionais):
  - customerNumber: filtro por cliente
  - referenceMonth: filtro por mês (YYYY-MM)
  - page: página (padrão: 1)
  - limit: registros por página (padrão: 10, máx: 100)

Respostas:
  200 OK: { data: [...], meta: { total, page, limit, totalPages } }
```

**Exemplo cURL**:
```bash
curl "http://localhost:3000/invoices?customerNumber=123456&page=1&limit=5"
```

---

## 📡 Testando via Swagger

Quando servidor está rodando:

1. Acesse: **http://localhost:3000/api/docs**
2. Clique em qualquer endpoint
3. Clique "Try it out"
4. Preencha parâmetros e envie

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Modo watch
npm test:watch

# Cobertura
npm test:cov

# Testes E2E
npm run test:e2e
```

**Cobertura**:
- ✅ `InvoicesService`: cálculos, conflito, falha LLM, dashboard
- ✅ `UploadController`: sucesso, exceções, file filters
- ✅ E2E: rejeição de arquivo não-PDF

---

## 📁 Estrutura do Projeto

```
src/
├── main/
│   └── index.ts                    # Bootstrap & Swagger setup
├── shared/
│   ├── decorators/
│   │   └── transaction.ts          # @Transactional() decorator
│   ├── dtos/
│   │   └── paginated-response.dto.ts
│   ├── infra/db/
│   │   ├── base-repository.ts      # Classe abstrata para repos
│   │   ├── prisma.service.ts       # Cliente Prisma
│   │   ├── transaction-context.ts  # Context manager
│   │   └── module/prisma.module.ts
│   └── module/app.module.ts
├── invoices/
│   ├── controllers/invoices.controller.ts    # GET /dashboard, GET /invoices
│   ├── services/invoices.service.ts          # Lógica de negócio
│   ├── repositories/invoices.repository.ts   # Acesso a dados (Prisma)
│   ├── facade/invoices.facade.ts             # Exposição para outros módulos
│   ├── contracts/                            # Abstrações (interfaces)
│   ├── dto/                                  # Data Transfer Objects
│   └── module/invoices.module.ts
├── llm/
│   ├── services/llm.service.ts              # Google Generative AI
│   ├── types/processed-invoice.type.ts      # Tipos do LLM
│   ├── utils/
│   │   ├── prompt.ts                        # Prompt customizado
│   │   └── safe-json-parse.ts               # Parser seguro
│   └── module/llm.module.ts
└── upload/
    ├── controllers/upload.controller.ts     # POST /upload/invoice-pdf
    ├── module/upload.module.ts
    └── contracts/

prisma/
├── migrations/                      # Histórico de migrações
├── schema/
│   ├── processed_invoices.prisma   # Modelo ProcessedInvoice
│   ├── raw_invoices.prisma         # Modelo RawInvoice
│   └── schema.prisma               # Schema principal
└── prisma.config.ts

test/
├── jest-e2e.json                   # Config Jest e2e
└── upload.e2e-spec.ts              # Testes e2e
```

---

## 🐛 Troubleshooting

### Docker não inicia

```bash
# Verifique se Docker está rodando
docker ps

# Força rebuild e limpa
npm run docker:down
npm run docker:rebuild
```

### "Connection refused" ao banco

```bash
# Espere 5-10s, o PostgreSQL leva tempo para iniciar
npm run docker:logs

# Busque por "database system is ready"
```

### "Only PDF files are allowed"

Sua arquivo não é um PDF válido ou tem mimetype inválido. Verifique:
```bash
file seu-arquivo.pdf
```

### "Invoice for this customer and reference month already exists"

Você está tentando processar a mesma fatura 2x. Use cliente/mês diferentes.

### Testes falhando

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install

# Rode testes novamente
npm test
```

---

## 📝 Como Executar Comandos Comuns

### Desenvolvimento

```bash
# Watch mode (recarrega ao salvar)
npm run start:dev

# Debug mode
npm run start:debug

# Linter
npm run lint

# Format
npm run format
```

### Produção

```bash
# Build
npm run build

# Rodá  
npm run start:prod
```

### Database

```bash
# Ver estado das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name seu_nome

# Resetar banco (⚠️ destrutivo)
npx prisma db push --reset

# Abrir UI do Prisma
npx prisma studio
```

### Docker

```bash
# Ver logs em tempo real
npm run docker:logs

# Parar containers
npm run docker:down

# Reiniciar sem rebuildar
npm run docker:restart

# Rebuild completo
npm run docker:rebuild
```

---

## 📞 FAQ

**P: O servidor subiu mas Swagger está vazio?**

A: Espere alguns segundos, o build e migrations levam tempo. Recarregue a página.

**P: Como habilitar a IA real (Google Gemini)?**

A:
1. Obtenha chave: https://aistudio.google.com/apikey
2. Configure `GOOGLE_AI_API_KEY=sua-chave` no `.env`

**P: Limite de tamanho de arquivo?**

A: 20MB (configurável em `src/upload/controllers/upload.controller.ts`, opção `limits.fileSize`)

**P: Qual a latência esperada?**

A: < 500ms para cálculos locais. LLM pode levar 2-5s dependendo da API

---

## 📜 Licença

Unlicensed (código de avaliação técnica)

---

## 👨‍💻 Contato

Desenvolvido como desafio prático para Lumi

---
