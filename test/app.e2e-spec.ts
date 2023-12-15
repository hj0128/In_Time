import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CustomExceptionFilter } from '../src/commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new CustomExceptionFilter());
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/mypage (GET)', async () => {
    return request(app.getHttpServer())
      .get('/mypage')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/point (GET)', async () => {
    return request(app.getHttpServer())
      .get('/point')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/party (GET)', async () => {
    return request(app.getHttpServer())
      .get('/party')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/party/create (GET)', async () => {
    return request(app.getHttpServer())
      .get('/party/create')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/plan (GET)', async () => {
    return request(app.getHttpServer())
      .get('/plan')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/plan/create (GET)', async () => {
    return request(app.getHttpServer())
      .get('/plan/create')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/friend/list (GET)', async () => {
    return request(app.getHttpServer())
      .get('/friend/list')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/signIn (GET)', async () => {
    return request(app.getHttpServer())
      .get('/signIn')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });

  it('/signUp (GET)', async () => {
    return request(app.getHttpServer())
      .get('/signUp')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8');
  });
});
