import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { CustomExceptionFilter } from '../../../commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { AuthLoginDto, AuthSendTokenDto } from '../auth.dto';
import { UserCreateDto, UserDeleteDto } from '../../user/user.dto';

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'A',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };

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

    const inputUserCreateDto: UserCreateDto = {
      name: 'A',
      email: 'a@a.com',
      password: '1234',
      profileUrl: 'https://a.jpg',
      userEmail: 'user@gmail.com',
    };
    const userResponse = await request(app.getHttpServer())
      .post('/user/userCreate')
      .send(inputUserCreateDto)
      .expect(201);
    mockJwtReqUser.id = userResponse.body.id;

    const inputAuthLoginDto: AuthLoginDto = {
      email: 'a@a.com',
      password: '1234',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/authLogin')
      .send(inputAuthLoginDto)
      .expect(201);
    accessToken = response.text;
    refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .post('/auth/authLogout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(201);

    const inputUserDeleteDto: UserDeleteDto = { userID: mockJwtReqUser.id };

    await request(app.getHttpServer())
      .delete('/user/userDelete')
      .send(inputUserDeleteDto)
      .expect(200);

    await app.close();
  });

  describe('Auth e2e test', () => {
    it('/auth/authSendToken (Post)', async () => {
      const inputAuthSendTokenDto: AuthSendTokenDto = {
        email: 'guswn2332@gmail.com',
        tokenNumber: '000000',
      };

      await request(app.getHttpServer())
        .post('/auth/authSendToken')
        .send(inputAuthSendTokenDto)
        .expect(201);
    });

    it('/auth/authSocialLogin (Get)', async () => {
      const response = await request(app.getHttpServer()).get('/auth/google').expect(302);

      expect(response.header['location']).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgoogle&scope=email%20profile&client_id=126181214559-sq83fkot7kajpfskmu6ikoaphrfiqm63.apps.googleusercontent.com',
      );
    });

    it('/auth/authRestoreAccessToken (Post)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/authRestoreAccessToken')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(201);

      expect(typeof response.text).toBe('string');
    });
  });
});
