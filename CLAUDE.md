# Project Conventions

## Architecture

### Backend Flow

Routes → Controllers → Services

- **Routes**: Handle HTTP requests/responses only. Minimal logic.
- **Controllers**: Parse input, call services, return responses. Keep lean.
- **Services**: All business logic lives here. Single responsibility per
  service.

### Middleware Validators

Validation middleware validates and transforms route parameters before they
reach controllers.

**Pattern:**

- Middleware validates `req.params.id` (the route parameter)
- Stores validated value with descriptive name: `req.params.workflowId`
- Controllers use the validated parameter name, not the original

**Benefits:**

- Validation happens once in middleware, not repeated in controllers
- Controllers trust values are already validated
- Clear separation: validation in middleware, business logic in services

### Code Organization

- Use `shared/` for code reused across server and public
- Keep files small and focused
- One responsibility per file
- Extract constants to avoid magic strings/numbers

## Key Principles

### DRY (Don't Repeat Yourself)

- Extract common logic into utilities or services
- Reuse shared components and functions

### Single Responsibility

- Each file should have one clear purpose
- Each function should do one thing well

### No Magic Values

- All hardcoded strings and numbers must be constants
- Define constants at the top of files or in dedicated constant files

### No code smells

- No fallback logic, we want consistent logic
- No patches, hacks, or workarounds: code should be sound
- Don't leave "temporary" code in the codebase

### Keep Files Small

- Avoid bloated files
- Split large files into focused modules
- React components should be meaningful and leverage mobx to avoid prop drilling
- Service files on the backend should stay focused with single responsibility
  (within reason)

## Tech Stack

- **Backend**: Express.js, TypeScript, Sequelize ORM
- **Frontend**: React, Vite
- **Database**: PostgreSQL (via Sequelize), Supabase in prod
- **Package Manager**: pnpm (monorepo)

## Important notes

- Never run `pnpm run dev` or migrations, don't start the server, or client - I
  will do these myself manually
