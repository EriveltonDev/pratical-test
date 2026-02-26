# Lumi Invoices API

Backend para processar faturas de energia elétrica com IA, extraindo dados de PDFs e calculando métricas de consumo e economia com geração distribuída.

---

## 📋 Resumo Rápido

- **Linguagem**: TypeScript 5.x
- **Framework**: NestJS 11.x
- **Banco de dados**: PostgreSQL 18 + Prisma 7.x
- **IA/LLM**: Google Generative AI (Gemini 2.0 Flash)
- **Containerização**: Docker + Docker Compose
- **Documentação**: Swagger/OpenAPI 3.0

---

## 🚀 Início Rápido (Docker - Recomendado)

```bash
npm run docker:rebuild
```

### Acessar a API

- **Local**: http://localhost:3000/api/docs (Swagger)
- **Produção**: https://lumi-pratical-test.onrender.com/api/docs (Swagger)

---

## 🖥️ Execução Local

### Requisitos
- Node.js 20+ (recomendado 22+)
- PostgreSQL 16+ rodando localmente
- npm/yarn

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (.env)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
# PORT=3000
# GOOGLE_AI_API_KEY=sua_chave_aqui

# 3. Executar migrations
npx prisma migrate deploy

# 4. Iniciar em desenvolvimento
npm run start:dev
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória | Exemplo |
|----------|-----------|-------------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | Sim | `postgresql://postgres:postgres@db:5432/app_db` |
| `PORT` | Porta do servidor | Não | `3000` |
| `NODE_ENV` | Ambiente de execução | Não | `development` ou `production` |
| `GOOGLE_AI_API_KEY` | Chave da API Google Generative AI | Sim (para processamento de PDFs) | Obtém em [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GOOGLE_AI_MODEL` | Modelo Gemini a usar | Não | `gemini-2.0-flash-lite` |

---

## 📡 Endpoints Principais

### Upload de Fatura
```bash
POST /upload/invoice-pdf
Content-Type: multipart/form-data

file: seu_arquivo.pdf
```

**Resposta de sucesso (201)**:
```json
{
  "customerNumber": "123456",
  "referenceMonth": "FEV/2026",
  "totalEnergyConsumptionKwh": 470.8,
  "compensatedEnergyKwh": 50.0,
  "totalAmountWithoutGd": 713.2,
  "gdSavings": 75.0
}
```

### Dashboard do Cliente
```bash
GET /dashboard?customerNumber=123456
```

**Resposta (200)**:
```json
{
  "energy": {
    "totalEnergyConsumptionKwh": 470.8,
    "compensatedEnergyKwh": 50.0
  },
  "financial": {
    "totalAmountWithoutGd": 713.2,
    "gdSavings": 75.0
  }
}
```

### Listar Faturas
```bash
GET /invoices?customerNumber=123456&referenceMonth=FEV/2026&page=1&limit=10
```

**Resposta (200)**:
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

---

## 🛠️ Decisões Arquiteturais

### Arquitetura em Camadas (Clean Architecture)

```
┌─────────────────┐
│   Controller    │  ← Recebe requisições HTTP
└────────┬────────┘
         │
┌────────v────────┐
│     Facade      │  ← Orquestra serviços
└────────┬────────┘
         │
┌────────v────────┐
│     Service     │  ← Lógica de negócio
└────────┬────────┘
         │
┌────────v────────┐
│   Repository    │  ← Abstração de dados
└────────┬────────┘
         │
┌────────v────────┐
│  Prisma ORM     │  ← Queries tipadas
└────────┬────────┘
         │
┌────────v────────┐
│  PostgreSQL     │  ← Persistência
└─────────────────┘
```

**Benefícios**:
- Baixo acoplamento entre camadas
- Testes isolados por responsabilidade
- Fácil manutenção e expansão
- Código testável

### Escolhas Tecnológicas

| Tecnologia | Por que? |
|-----------|---------|
| **NestJS** | Estrutura robusta com injeção de dependência, Swagger integrado, decoradores TypeScript e suporte nativo a transações |
| **Prisma ORM** | Type-safe, migrations versionadas, queries intuitivas, transações nativas e excelente DX |
| **PostgreSQL** | Confiável, suporta transações ACID, excelente para relatórios (dashboard) |
| **Google Gemini (IA)** | Suporte nativo para análise de PDFs, baixa latência, token-efficient e disponível em free tier |
| **TypeScript** | Tipagem estática end-to-end reduz bugs, melhor intellisense e documentação inline |
| **Jest + Supertest** | Tests de unidade e E2E com cobertura, zero config, mocks isolados |

---

## 🧪 Testes

```bash
# Unitários
npm test

# Com cobertura
npm run test:cov

# E2E
npm run test:e2e

# Modo watch
npm test:watch
```

---

## 📦 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia aplicação (modo produção) |
| `npm run start:dev` | Inicia com reload automático (desenvolvimento) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run lint` | Verifica e corrige código com ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run docker:up` | Sobe containers com Docker Compose |
| `npm run docker:down` | Desce containers |
| `npm run docker:rebuild` | Reconstrói e sobe containers |
| `npm run docker:logs` | Ver logs dos containers |

---

## 📁 Estrutura do Projeto

```
src/
├── invoices/          # Módulo principal (faturas e dashboard)
│   ├── controllers/   # Endpoints HTTP
│   ├── services/      # Lógica de negócio
│   ├── repositories/  # Acesso a dados
│   ├── dto/          # Data transfer objects
│   └── contracts/    # Interfaces/abstrações
├── upload/           # Módulo de upload PDF
├── llm/             # Módulo de integração com IA
└── shared/          # Código compartilhado (DB, decorators)

prisma/
├── schema/          # Schemas (raw_invoices, processed_invoices)
└── migrations/      # Histórico de migrations

test/               # Testes E2E
```


