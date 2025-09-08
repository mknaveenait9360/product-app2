import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const server = supertest(app.getHttpServer());

    await server.get('/').expect(200).expect('Hello World!');
  });
});
