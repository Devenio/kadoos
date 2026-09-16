import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16).default('kadoos-dev-desk-secret'),
});

export type Env = z.infer<typeof envSchema>;
