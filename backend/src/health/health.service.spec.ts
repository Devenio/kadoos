import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('HealthService', () => {
  let service: HealthService;
  let ping: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    ping = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            ping,
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns ok when the database responds', async () => {
    ping.mockResolvedValue(undefined);

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });
  });

  it('throws when the database is unavailable', async () => {
    ping.mockRejectedValue(new Error('connection refused'));

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
