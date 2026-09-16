# Kadoos

A modern appointment booking platform for men’s barbershops.

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
npm run prisma:migrate -- --name init_shops
npm run prisma:seed
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

Open `http://localhost:3000/en/shops` or `/fa/shops` for the public shop directory.

```bash
curl http://127.0.0.1:4000/shops
```

## Milestone 2

Public shop discovery is live. Customers can browse seeded barbershops and open a shop’s barbers, services, and hours.

- `GET /shops`
- `GET /shops/:slug`
- English: `/en/shops`
- Persian: `/fa/shops`

Booking, authentication, and owner dashboards are not in this milestone.

## Milestone 1

Project foundation and design system:

- App scaffolding
- Design tokens and core UI
- Public landing page
- Database connection
- `GET /health`

No authentication, payments, or booking engine yet.
