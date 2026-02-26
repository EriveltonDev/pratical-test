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
> **Por que essa arquitetura?**
>
> Optei por um modelo em camadas para **baixo acoplamento** entre componentes e maior clareza das responsabilidades. Isso facilita a manutenção e a substituição de partes da aplicação sem causar efeitos colaterais.

# Lumi Invoices API — README enxuto

Resumo rápido
- Backend NestJS para processar faturas de energia (upload PDF → extração via LLM → persistência no Postgres).

Requisitos
- Node.js 20+ (recomendado 22+)
- Docker & Docker Compose (recomendado)
- PostgreSQL 16+ (se rodar localmente)

Variáveis de ambiente essenciais
- `DATABASE_URL` — string de conexão Postgres (ex: postgresql://postgres:postgres@db:5432/app_db)
- `PORT` — porta do servidor (padrão 3000)
- `GOOGLE_AI_API_KEY` — chave da API do LLM (opcional para testes)
- `GOOGLE_AI_MODEL` — modelo (ex: gemini-2.0-flash-lite)
- `NODE_ENV` — ambiente (`development`/`production`)

Instalação e execução
1) Instalar dependências:
```
npm install
```
2) Gerar Prisma client (normalmente executado no `postinstall`):
```
npx prisma generate
```
3) Executar migrations:
```
npx prisma migrate deploy
```
4) Rodar em desenvolvimento:
```
npm run start:dev
```
Rodando em produção (Docker)
```
# construir imagem (ex.: usando Dockerfile.prod)
docker build -f Dockerfile.prod -t lumi-prod:latest .

# rodar (defina DATABASE_URL externamente)
docker run --rm -e DATABASE_URL="postgresql://postgres:postgres@db:5432/app_db" -p 3000:3000 lumi-prod:latest
```

Endpoints principais (exemplos)
- Upload de fatura (multipart/form-data):
```
POST /upload/invoice-pdf
Form field: file (PDF)
```
- Dashboard por cliente:
```
GET /dashboard?customerNumber=123456
```
- Listar faturas (opcionalmente paginado):
```
GET /invoices?customerNumber=123456&referenceMonth=FEV/2026&page=1&limit=10
```

Decisões arquiteturais e escolhas tecnológicas
- Framework: **NestJS** — rapidez no desenvolvimento, injeção de dependência, integração com Swagger e testes.
- ORM: **Prisma** — cliente type-safe, migrations versionadas e ergonomia para consultas.
- LLM: **Google Gemini (Generative AI)** — escolhido pelo free tier disponível para prova de conceito e boa integração com análise de texto/PDF.
- Arquitetura: **Camadas (Controller → Service → Repository → Prisma → Postgres)** para baixo acoplamento e testabilidade.

Testes
- Unitários e E2E com Jest. Execute:
```
npm test
npm run test:e2e
```

Observações de deploy
- Recomendo rodar `npx prisma migrate deploy` no pipeline/entrypoint antes de iniciar a aplicação em produção.
- Há um `Dockerfile.prod` multi-stage na raiz para build + runtime.

Contato
- Repositório: código entregue como teste prático.
