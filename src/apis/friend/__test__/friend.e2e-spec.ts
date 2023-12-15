import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { CustomExceptionFilter } from '../../../commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { UserCreateDto, UserDeleteDto } from '../../user/user.dto';
import { AuthLoginDto } from '../../auth/auth.dto';
import {
  FriendCreateDto,
  FriendRefuseDto,
  FriendUnFriendDto,
  FriendUpdateDto,
} from '../friend.dto';

describe('FriendController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'B',
    email: 'b@b.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'C',
    email: 'c@c.com',
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
      name: 'B',
      email: 'b@b.com',
      password: '1234',
      profileUrl: 'https://a.jpg',
      userEmail: 'user@gmail.com',
    };
    const userResponse = await request(app.getHttpServer())
      .post('/user/userCreate')
      .send(inputUserCreateDto)
      .expect(201);
    mockJwtReqUser.id = userResponse.body.id;

    const inputUserCreateDto2: UserCreateDto = {
      name: 'C',
      email: 'c@c.com',
      password: '1234',
      profileUrl: 'https://a.jpg',
      userEmail: 'user@gmail.com',
    };
    const userResponse2 = await request(app.getHttpServer())
      .post('/user/userCreate')
      .send(inputUserCreateDto2)
      .expect(201);
    mockJwtReqUser2.id = userResponse2.body.id;
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

    const inputUserDeleteDto2: UserDeleteDto = { userID: mockJwtReqUser2.id };
    await request(app.getHttpServer())
      .delete('/user/userDelete')
      .send(inputUserDeleteDto2)
      .expect(200);

    await app.close();
  });

  describe('setting', () => {
    it('C login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'c@c.com',
        password: '1234',
      };
      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });
  });

  let friendID: string;
  describe('Friend e2e test', () => {
    it('/friend/friendCreate (Post)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'B' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('toUserID');
      expect(response.body).toHaveProperty('isAccepted');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.user.id).toBe(mockJwtReqUser2.id);
      expect(response.body.toUserID).toBe(mockJwtReqUser.id);
      expect(response.body.isAccepted).toBe('SENT');
    });

    it('/friend/friendFindWithUserID (Get)', async () => {
      const response = await request(app.getHttpServer())
        .get('/friend/friendFindWithUserID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('friendID');
      expect(response.body[0]).toHaveProperty('fromUserID');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('profileUrl');
      expect(response.body[0]).toHaveProperty('badgeUrl');
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0].fromUserID).toBe(mockJwtReqUser.id);
      expect(response.body[0].name).toBe(mockJwtReqUser.name);
    });
  });

  describe('setting', () => {
    it('B login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'b@b.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });
  });

  describe('Friend e2e test', () => {
    it('/friend/friendUpdate (Post)', async () => {
      const inputFriendUpdateDto: FriendUpdateDto = { friendID, fromUserID: mockJwtReqUser2.id };

      const response = await request(app.getHttpServer())
        .post('/friend/friendUpdate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendUpdateDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('toUserID');
      expect(response.body).toHaveProperty('isAccepted');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.user.id).toBe(mockJwtReqUser.id);
      expect(response.body.toUserID).toBe(mockJwtReqUser2.id);
      expect(response.body.isAccepted).toBe('FRIENDSHIP');
    });

    it('/friend/friendUnFriend (Delete)', async () => {
      const inputFriendUnFriendDto: FriendUnFriendDto = { fromUserID: mockJwtReqUser2.id };

      await request(app.getHttpServer())
        .delete('/friend/friendUnFriend')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendUnFriendDto)
        .expect(200);
    });
  });

  let friendID2: string;
  describe('setting', () => {
    it('B -> C (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'C' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID2 = response.body.id;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('toUserID');
      expect(response.body).toHaveProperty('isAccepted');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.user.id).toBe(mockJwtReqUser.id);
      expect(response.body.toUserID).toBe(mockJwtReqUser2.id);
      expect(response.body.isAccepted).toBe('SENT');
    });

    it('C login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'c@c.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });
  });

  describe('Friend e2e test', () => {
    it('/friend/friendRefuse (Delete)', async () => {
      const inputFriendRefuseDto: FriendRefuseDto = { friendID: friendID2 };

      await request(app.getHttpServer())
        .delete('/friend/friendRefuse')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendRefuseDto)
        .expect(200);
    });
  });
});
