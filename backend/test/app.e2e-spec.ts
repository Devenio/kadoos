import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;
  const ping = vi.fn();

  beforeEach(async () => {
    ping.mockReset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        ping,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns ok when the database is connected', async () => {
    ping.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        database: 'connected',
      });
  });

  it('GET /health returns 503 when the database is unavailable', async () => {
    ping.mockRejectedValue(new Error('connection refused'));

    await request(app.getHttpServer())
      .get('/health')
      .expect(503)
      .expect({
        status: 'error',
        database: 'disconnected',
      });
  });

  it('GET /desk/appointments without a cookie is 401', async () => {
    await request(app.getHttpServer()).get('/desk/appointments').expect(401);
  });
});
