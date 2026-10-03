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

4. **Run database seeds** (populates states and cities; creates a base dev user when `NODE_ENV=development`)

   ```bash
   pnpm seed
   ```

5. **Run the API** (watch mode)

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

### Mobile E2E preparation (staging only)

Configure `NODE_ENV=staging`, the staging database connection (`DB_URL` or
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and `QR_CODE_SECRET`
with the same value used by the staging API. Apply migrations before preparing:

```sh
pnpm prepare:e2e
```

This command refuses any other `NODE_ENV` before connecting. It writes directly
to the database, without starting NestJS or contacting PagBank/email services.
Each run creates or updates the e2e account, preserving its ID when the
email already exists.

Each run creates a new online music event starting in seven days, a free ticket
type with stock for the purchase test and a paid ticket type. A confirmed order,
order item and active ticket with an encrypted QR are inserted for the paid
type, with stock reduced by one. This is prepared test data, not a payment;
no gateway transaction is created. The free type remains unused by the account.
Organizer payment info is inserted if the account does not already have it.
Before creating the new dataset, the command removes all tickets, order items,
orders, favorites and ratings belonging to the dedicated E2E account. It also
removes previous events created by this preparator (account ownership plus the
`Corevent Mobile E2E ` title prefix) and their dependent records. Other events and
accounts are preserved. If a prepared event has purchases, interactions, staff
or changes belonging to another user, preparation aborts and rolls back.
This clears legacy QR tokens encrypted with previous keys. No favorites or
ratings are created in the new dataset.

All writes use one transaction. Conflicts such as the CPF belonging to a
different account abort the transaction. Run suites sequentially: the account
is shared and its profile fields/password are restored by every preparation.
Do not prepare while a suite is running. API instances sharing this database
must use the same `QR_CODE_SECRET` as the preparator; its presence is checked,
but the script cannot compare its value with a deployed API.

After commit, the final stdout line is a JSON object:

```json
{
  "schemaVersion": 1,
  "runId": "run-uuid",
  "userId": "user-uuid",
  "email": "e2e@email.com",
  "eventId": "event-uuid",
  "freeTicketName": "Ingresso gratuito E2E",
  "freeTicketTypeId": "free-type-uuid",
  "paidTicketTypeId": "paid-type-uuid",
  "orderId": "order-uuid",
  "ticketId": "ticket-uuid"
}
```

Use `eventId` as `COREVENT_E2E_EVENT_ID` and `freeTicketName` as
`COREVENT_E2E_FREE_TICKET_NAME` in the mobile Flutter flags, with this account
and the staging API URL. Prepare again before each complete suite; an already
purchased free type cannot be purchased again by the same user. Errors are
reported as JSON on stderr with a nonzero exit code. The log omits passwords,
password hashes, QR tokens and database credentials.
