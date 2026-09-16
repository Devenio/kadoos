import 'dotenv/config';
import { envSchema, type Env } from './env.schema.js';

export const env: Env = envSchema.parse(process.env);
