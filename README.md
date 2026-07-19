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

## Módulo Contacts (Sprint 3)

Todas as rotas abaixo exigem autenticação (`Authorization: Bearer <accessToken>`) e são sempre restritas ao usuário autenticado — nunca é possível ver, editar ou remover contatos de outro usuário. A exclusão é lógica (soft delete via `deletedAt`); nenhum contato é apagado fisicamente.

```bash
# Criar contato
curl -X POST http://localhost:3001/contacts \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Souza","email":"maria@empresa.com","company":"Empresa X","position":"Compradora"}'

# Listar (paginado, com filtros opcionais)
curl "http://localhost:3001/contacts?page=1&limit=10&name=Maria" \
  -H "Authorization: Bearer <accessToken>"

# Buscar por id
curl http://localhost:3001/contacts/<id> \
  -H "Authorization: Bearer <accessToken>"

# Atualizar (qualquer campo, todos opcionais)
curl -X PATCH http://localhost:3001/contacts/<id> \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"phone":"(15) 99999-0000"}'

# Remover (soft delete)
curl -X DELETE http://localhost:3001/contacts/<id> \
  -H "Authorization: Bearer <accessToken>"
```

Um contato de outro usuário, ou já removido (soft deleted), retorna `404` em `GET`, `PATCH` e `DELETE`.

## Módulo Deals (Sprint 4)

Todas as rotas exigem autenticação (`Authorization: Bearer <accessToken>`) e são sempre restritas ao usuário autenticado — nunca é possível ver, editar ou remover deals de outro usuário. Cada deal pertence a um `Contact`, que também precisa pertencer ao usuário autenticado (validado no `create` e sempre que `contactId` é alterado). Opcionalmente, um deal pode ser associado a um `Stage` via `stageId` (validado da mesma forma). A exclusão é lógica (soft delete via `deletedAt`); nenhum deal é apagado fisicamente. O campo `status` permanece disponível (inicial: `OPEN`) como complemento ao pipeline.

```bash
# Criar deal
curl -X POST http://localhost:3001/deals \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Contrato anual","contactId":"<contactId>","stageId":"<stageId>","value":15000.00}'

# Listar (paginado, com filtros opcionais)
curl "http://localhost:3001/deals?page=1&limit=10&status=OPEN" \
  -H "Authorization: Bearer <accessToken>"

# Buscar por id
curl http://localhost:3001/deals/<id> \
  -H "Authorization: Bearer <accessToken>"

# Atualizar (qualquer campo, todos opcionais)
curl -X PATCH http://localhost:3001/deals/<id> \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"status":"WON"}'

# Remover (soft delete)
curl -X DELETE http://localhost:3001/deals/<id> \
  -H "Authorization: Bearer <accessToken>"
```

Um deal de outro usuário, ou já removido (soft deleted), retorna `404` em `GET`, `PATCH` e `DELETE`. Criar ou atualizar um deal apontando para um `contactId` ou `stageId` inexistente ou de outro usuário também retorna `404`.

## Módulo Stages / Pipeline (Sprint 5)

Todas as rotas exigem autenticação (`Authorization: Bearer <accessToken>`) e são sempre restritas ao usuário autenticado. A exclusão é lógica (soft delete via `deletedAt`); nenhum estágio é apagado fisicamente. Um estágio com deals vinculados (não removidos) **não pode ser excluído** — a tentativa retorna `409 Conflict`. Deals agora podem ser associados a um estágio via `stageId` (opcional, para não quebrar deals já existentes sem pipeline).

```bash
# Criar estágio
curl -X POST http://localhost:3001/stages \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Qualificação","color":"#facc15","order":1}'

# Listar (paginado, ordenado por "order")
curl "http://localhost:3001/stages?page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"

# Buscar por id
curl http://localhost:3001/stages/<id> \
  -H "Authorization: Bearer <accessToken>"

# Atualizar
curl -X PATCH http://localhost:3001/stages/<id> \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"order":2}'

# Remover (soft delete — falha com 409 se houver deals vinculados)
curl -X DELETE http://localhost:3001/stages/<id> \
  -H "Authorization: Bearer <accessToken>"
```

Um estágio de outro usuário, ou já removido, retorna `404` em `GET`, `PATCH` e `DELETE`.

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
- ✅ Módulo Contacts: CRUD completo, paginação, filtros, soft delete
- ✅ Módulo Deals: CRUD completo, vínculo com Contacts e Stages, paginação, filtros, soft delete
- ✅ Módulo Stages/Pipeline: CRUD completo, ordenação por estágio, soft delete, proteção contra exclusão com deals vinculados
- ⏳ Módulos de negócio (Activities), telas e IA: ainda não implementados
