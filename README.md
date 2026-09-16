# Kadoos

Appointment booking for men’s barbershops. Guests pay the cut to hold a chair. Shop owners see today on a simple desk.

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
- A ZarinPal merchant (one for Kadoos, not one per shop)

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

3. In the ZarinPal panel, before paying in the app:

- Copy `merchant_id` into `ZARINPAL_MERCHANT_ID`
- Turn on floating wages (تسهیم اشتراکی شناور)
- Add the platform settlement bank account
- Register the callback domain (`localhost` for sandbox)

4. Install, migrate, and seed:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Run the API:

```bash
npm run dev:backend
```

The API listens on `http://127.0.0.1:4000`.

6. Run the app:

```bash
npm run dev:frontend
```

The app listens on `http://localhost:3000`.

Browser calls go to `/api/*` on the Next app and are rewritten to the API, so the shop desk cookie stays on the same site.

## Payments

Kadoos is the single ZarinPal merchant. Guests pay the service price in **toman** (`currency: IRT`, same unit as `priceToman`). ZarinPal’s default is rial (`IRR`); do not send toman amounts without `IRT`. Minimum payment is 10,000 rial (1,000 toman).

The platform keeps `KADOOS_FEE_PERCENT` (default 10). The rest goes to the shop as a floating wage using the shop’s IBAN. Do not put the platform share in `wages` — ZarinPal keeps the remainder on the merchant.

A shop without a valid IBAN (`IR` + 24 digits) and `payoutReady` cannot start a paid booking.

Env (see `backend/.env.example`):

- `ZARINPAL_MERCHANT_ID` — one Kadoos terminal
- `ZARINPAL_SANDBOX=true` in development (`false` live)
- `KADOOS_FEE_PERCENT=10`
- `ZARINPAL_CALLBACK_URL` — must match the domain registered on the terminal (error `-14` otherwise). Local example: `http://localhost:3000/{locale}/payments/callback`
- `SEED_SHOP_IBAN` — dummy sandbox sheba for seeded shops, not a real account

Official SDK: `zarinpal-node-sdk`. Refunds need `zarinpal.refunds` plus an access token — not in this pass.

## How to use it

- English: `/en`
- Persian: `/fa` (right-to-left)
- Book: open a shop, tap **Book a chair**, then service → barber → day → time → name and phone → **Pay with ZarinPal**
- Callback: `/en/payments/callback` and `/fa/payments/callback`
- Find a booking: **My booking**, with the code and the same phone
- Shop desk: `/en/desk` (Persian: `/fa/desk`)

### Shop desk

The desk is for the shop owner, not guests. After sign-in there is a persistent panel:

| Route | What it is |
| --- | --- |
| `/[locale]/desk` | Today’s live queue |
| `/[locale]/desk/calendar` | Day / week agenda |
| `/[locale]/desk/barbers` | Team |
| `/[locale]/desk/services` | Menu and prices |
| `/[locale]/desk/hours` | Weekly open / close |
| `/[locale]/desk/shop` | Public profile |
| `/[locale]/desk/payouts` | IBAN and recent paid bookings |
| `/[locale]/desk/settings` | Owner password and theme |

Seeded desk logins (password `chair123`):

- `farhad@kadoos.local`
- `siah@kadoos.local`
- `khosrow@kadoos.local`

Cookie session lasts 7 days (`kadoos-desk`, httpOnly). The panel only sees that owner’s shop. Inactive barbers and services, plus barber time-off, are hidden from public booking.

Walk-ins from Today skip ZarinPal. Online guest bookings still pay first. Payouts use `Shop.iban` (`IR` + 24 digits) and `KADOOS_FEE_PERCENT`. Merchant secrets are never shown in the desk.

## Verify

```bash
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:4000/shops
cd backend && npm test
```

Without `ZARINPAL_MERCHANT_ID`, a paid book should fail before redirect:

```bash
curl -sS -X POST http://127.0.0.1:4000/payments/zarinpal/request \
  -H 'content-type: application/json' \
  -d '{"slug":"farhad","serviceId":"x","date":"2026-09-17","time":"11:00","customerName":"Nima","customerPhone":"09121234567","locale":"en"}'
```

Expect `ZARINPAL_NOT_CONFIGURED` (or `Unknown service` once the merchant is set).

Sandbox payment check:

1. Book Farhad at `/en/shops/farhad/book` (or `/fa/...`).
2. Pay on ZarinPal sandbox and return. The appointment should be `booked` with a code; the payment `paid` with `ref_id`.
3. Cancel at the gateway: no booked appointment, that slot is free again.
4. Refresh the callback URL: still one booking (ZarinPal code `101`).
5. A shop without IBAN must fail before redirect, with a clear error.
