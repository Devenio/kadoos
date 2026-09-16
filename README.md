# Kadoos

Appointment booking for men’s barbershops. Guests book with a name and phone. Shop owners see today on a simple desk.

Frontend and backend live in separate folders.

```
kadoos/
  frontend/   Next.js
  backend/    NestJS + Prisma
```

## Prerequisites

- Node.js 20.19+ (22 or 24 recommended)
- Docker
- npm

`DATABASE_URL` and `NEXT_PUBLIC_API_URL` use `127.0.0.1` instead of `localhost` so local services do not hang on IPv6.

## Local setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Copy environment files if needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Install, migrate, and seed:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Run the API:

```bash
npm run dev:backend
```

The API listens on `http://127.0.0.1:4000`.

5. Run the app:

```bash
npm run dev:frontend
```

The app listens on `http://localhost:3000`.

Browser calls go to `/api/*` on the Next app and are rewritten to the API, so the shop desk cookie stays on the same site.

## How to use it

- English: `/en`
- Persian: `/fa` (right-to-left)
- Book: open a shop, tap **Book a time**, then service → barber → day → time → name and phone
- Find a booking: **My booking**, with the code and the same phone
- Shop desk: `/en/desk`

Seeded desk logins (password `chair123`):

- `farhad@kadoos.local`
- `siah@kadoos.local`
- `khosrow@kadoos.local`

## Verify

```bash
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:4000/shops
```
