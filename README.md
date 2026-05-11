<p align="center">
  <a target="blank"><img src="assets/corevent.png" width="600" alt="Corevent Logo" /></a>
</p>

## Description

Corevent API is the backend service for the Corevent event management platform. Built with NestJS and TypeORM, it exposes a REST API (documented with Swagger and Scalar) for creating, managing, and joining events.

## Project setup

### Prerequisites

- Node.js (LTS recommended)
- [pnpm](https://pnpm.io/installation)
- PostgreSQL, with an empty database created for this project

### Local flow

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - **Database:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` so they match your PostgreSQL instance and database.
   - **Auth:** `JWT_SECRET` and `JWT_REFRESH_SECRET` (required for sign-in and protected routes).

   Optional: `NODE_ENV`, `PORT` (defaults to `3000` if unset).

3. **Apply migrations** (creates and updates tables; run against the same database as in `.env`)

   ```bash
   pnpm migration:run
   ```

4. **Run the API** (watch mode)

   ```bash
   pnpm start:dev
   ```

   HTTP API base path: `/api`. Interactive docs: `/swagger` and `/docs`.

### Schema changes (developers)

When you change TypeORM entities and need a new migration:

```bash
pnpm migration:generate src/database/migrations/YourMigrationName
pnpm migration:run
```

Use `pnpm migration:create` instead of `migration:generate` when you want an empty migration file to edit by hand.