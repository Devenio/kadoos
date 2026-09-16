import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './common/config/env.schema.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ShopsModule } from './shops/shops.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PrismaModule,
    HealthModule,
    ShopsModule,
  ],
})
export class AppModule {}
