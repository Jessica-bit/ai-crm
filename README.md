# AI CRM

CRM moderno com recursos de Inteligência Artificial. Projeto de portfólio construído com Next.js, NestJS, PostgreSQL, Prisma e Docker.

## Estrutura do monorepo

```
ai-crm/
├── apps/
│   ├── web/        # Frontend — Next.js + TypeScript + Tailwind CSS
│   └── api/        # Backend — NestJS
├── packages/
│   ├── shared-types/  # Tipos/DTOs compartilhados entre web e api
│   └── tsconfig/      # Configurações base do TypeScript
├── docker/          # Configuração de containers (a definir)
└── docs/            # Documentação técnica e decisões de arquitetura
```

## Requisitos

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
pnpm install
```

## Banco de dados (PostgreSQL via Docker)

```bash
# 1. Subir o PostgreSQL
cd docker
docker compose up -d

# 2. Configurar variáveis de ambiente do backend
cd ../apps/api
cp .env.example .env

# 3. Gerar o Prisma Client
pnpm prisma:generate

# 4. Aplicar as migrations
pnpm prisma:migrate

# 5. Popular o banco (usuário admin + estágios padrão)
pnpm prisma:seed
```

## Autenticação (Sprint 2)

Com o banco de dados já configurado (seção acima) e a API rodando (`pnpm dev:api`):

```bash
# Registro
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jessica","email":"jessica@sublima.com","password":"senhaForte123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jessica@sublima.com","password":"senhaForte123"}'

# GET /auth/me (use o accessToken retornado no login/registro)
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Refresh (use o refreshToken retornado no login/registro)
curl -X POST http://localhost:3001/auth/refresh \
  -H "Authorization: Bearer <refreshToken>"

# Logout
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

## Desenvolvimento

```bash
pnpm dev:web   # inicia o frontend (http://localhost:3000)
pnpm dev:api   # inicia o backend (http://localhost:3001)
```

Com o banco configurado, `GET http://localhost:3001/health` deve retornar:
```json
{ "status": "ok", "database": "connected" }
```

## Status

- ✅ Fundação do monorepo (Next.js + NestJS + TypeScript compartilhado)
- ✅ Banco de dados: Docker Compose, Prisma, primeira migration e seed
- ✅ Autenticação: registro, login, JWT (access + refresh), guards, GET /me, logout
- ⏳ Módulos de negócio (Contacts, Deals, Stages, Activities), telas e IA: ainda não implementados
