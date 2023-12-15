import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { CustomExceptionFilter } from '../../../commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { AuthLoginDto } from '../../auth/auth.dto';
import { UserCreateDto, UserDeleteDto, UserSetRedisDto } from '../user.dto';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'N',
    email: 'n@n.com',
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
      name: 'N',
      email: 'n@n.com',
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
      email: 'n@n.com',
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
    const inputUserDeleteDto: UserDeleteDto = { userID: mockJwtReqUser.id };

    const response = await request(app.getHttpServer())
      .delete('/user/userDelete')
      .send(inputUserDeleteDto)
      .expect(200);

    expect(response.body).toEqual({});

    await app.close();
  });

  describe('User e2e test', () => {
    it('/user/userFindOneWithUserID (Get)', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/userFindOneWithUserID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('password');
      expect(response.body).toHaveProperty('point');
      expect(response.body).toHaveProperty('profileUrl');
      expect(response.body).toHaveProperty('badgeUrl');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.id).toBe(mockJwtReqUser.id);
    });

    it('/user/userFindOneWithName (Get)', async () => {
      const inputName: string = 'N';

      const response = await request(app.getHttpServer())
        .get('/user/userFindOneWithName')
        .query({ name: inputName })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('password');
      expect(response.body).toHaveProperty('point');
      expect(response.body).toHaveProperty('profileUrl');
      expect(response.body).toHaveProperty('badgeUrl');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.name).toBe(inputName);
    });

    it('/user/userFindOneWithEmail (Get)', async () => {
      const inputEmail: string = 'n@n.com';

      const response = await request(app.getHttpServer())
        .get('/user/userFindOneWithEmail')
        .query({ email: inputEmail })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('password');
      expect(response.body).toHaveProperty('point');
      expect(response.body).toHaveProperty('profileUrl');
      expect(response.body).toHaveProperty('badgeUrl');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.email).toBe(inputEmail);
    });

    it('/user/userSetRedis (Post)', async () => {
      const inputUserSetRedisDto: UserSetRedisDto = {
        myLat: 12.203,
        myLng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: false,
      };

      await request(app.getHttpServer())
        .post('/user/userSetRedis')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputUserSetRedisDto)
        .expect(201);
    });

    it('/user/userGetRedis (Get)', async () => {
      const inputUsersName = ['N', '유리'];

      const expectedUserSetRedis: UserSetRedisDto = {
        myLat: 12.203,
        myLng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: false,
      };

      const response = await request(app.getHttpServer())
        .get('/user/userGetRedis')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ usersName: inputUsersName })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('userName');
      expect(response.body[0]).toHaveProperty('myLat');
      expect(response.body[0]).toHaveProperty('myLng');
      expect(response.body[0]).toHaveProperty('time');
      expect(response.body[0]).toHaveProperty('isArrive');
      expect(response.body[0].userName).toBe(inputUsersName[0]);
      expect(response.body[0].myLat).toBe(expectedUserSetRedis.myLat);
      expect(response.body[0].myLng).toBe(expectedUserSetRedis.myLng);
      expect(response.body[0].time).toBe(expectedUserSetRedis.time);
      expect(response.body[0].isArrive).toBe(expectedUserSetRedis.isArrive);
    });

    it('/user/userSoftDelete (Delete)', async () => {
      await request(app.getHttpServer())
        .delete('/user/userSoftDelete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(200);
    });
  });
});
