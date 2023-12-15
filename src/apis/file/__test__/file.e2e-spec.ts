import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { CustomExceptionFilter } from '../../../commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Readable } from 'stream';

describe('FileController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
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

  describe('File e2e test', () => {
    it('/file/fileUpload (Post)', async () => {
      const inputFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'what.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        destination: 'uploads/',
        filename: 'test-uploaded.txt',
        path: 'uploads/test-uploaded.txt',
        buffer: Buffer.from('Mocked file content'),
        stream: Readable.from(['Mocked file content']),
      };

      const response = await request(app.getHttpServer())
        .post('/file/fileUpload')
        .attach('file', inputFile.buffer, { filename: inputFile.originalname })
        .expect(201);

      expect(typeof response.text).toBe('string');
    });
  });
});
