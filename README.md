# VJU Vision AI

VJU Vision AI is an MVC web application for authorized educational chart and screen analysis.

## Requirements

- Node.js 20 or later
- PostgreSQL 14 or later

## Setup

1. Copy `.env.example` to `.env`.
2. Update the PostgreSQL credentials.
3. Create the database: `CREATE DATABASE vju_vision_ai;`
4. Run `database/rebuild.sql` in PostgreSQL.
5. Run `pnpm install`.
6. Run `pnpm start`.
7. Open `http://localhost:3000/register`.

## Database rebuild

```powershell
psql -U postgres -d vju_vision_ai -f database/rebuild.sql
```

## Safety boundaries

The application is educational only. It does not execute trades or generate personalized live buy or sell instructions.
