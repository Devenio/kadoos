# Kadoos

A modern appointment booking platform for beauty salons.

Frontend and backend live in separate folders and are developed independently.

```
kadoos/
  frontend/   Next.js
  backend/    NestJS + Prisma
```

## Prerequisites

- Node.js 20.19+ (22 or 24 recommended; Prisma 7 warns on newer majors)
- Docker
- npm

`DATABASE_URL` and `NEXT_PUBLIC_API_URL` use `127.0.0.1` instead of `localhost` so local services do not hang on IPv6 (`::1`) when Postgres or the API is published on IPv4.

## Local setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Backend environment is already described in `backend/.env.example`. Copy it if needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Install and generate the Prisma client:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run prisma:generate
```

4. Run the API:

```bash
npm run dev:backend
```

The API listens on `http://localhost:4000`.

5. Run the app:

```bash
npm run dev:frontend
```

The app listens on `http://localhost:3000`.

## Verify

```bash
curl http://localhost:4000/health
```

Expected when Postgres is running:

```json
{"status":"ok","database":"connected"}
```

Open `http://localhost:3000` for the public landing page. The footer reads the health endpoint and shows whether booking is available.

## Milestone 1

This repository currently contains the project foundation and design system only:

- App scaffolding
- Design tokens and core UI
- Public landing page
- Database connection
- `GET /health`

No authentication, salons, or booking yet.
