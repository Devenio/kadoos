import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16).default('kadoos-dev-desk-secret'),
  ZARINPAL_MERCHANT_ID: z.string().default(''),
  ZARINPAL_SANDBOX: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  KADOOS_FEE_PERCENT: z.coerce.number().int().min(1).max(99).default(10),
  ZARINPAL_CALLBACK_URL: z
    .string()
    .min(1)
    .default('http://localhost:3000/{locale}/payments/callback'),
});

export type Env = z.infer<typeof envSchema>;
