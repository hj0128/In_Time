import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { CustomExceptionFilter } from '../../../commons/filter/custom-exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { AuthLoginDto } from '../../auth/auth.dto';
import { UserCreateDto, UserDeleteDto } from '../../user/user.dto';
import { UserLocationCreateDto } from '../user-location.dto';
import { PartyCreateDto, PartyDeleteDto } from '../../party/party.dto';
import { FriendCreateDto, FriendUpdateDto } from '../../friend/friend.dto';
import { PlanCreateDto } from '../../plan/plan.dto';

describe('UserController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'P',
    email: 'p@p.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'Q',
    email: 'q@q.com',
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
      name: 'P',
      email: 'p@p.com',
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
      name: 'Q',
      email: 'q@q.com',
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
    const inputPartyDeleteDto: PartyDeleteDto = { partyID };
    await request(app.getHttpServer())
      .delete('/party/partyDelete')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .send(inputPartyDeleteDto)
      .expect(200);

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

  let partyID: string;
  let planID: string;
  describe('setting', () => {
    let friendID: string;
    it('Q login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'q@q.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('Q -> P (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'P' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;
    });

    it('P login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'p@p.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('P -> Q (친구 수락)', async () => {
      const inputFriendUpdateDto: FriendUpdateDto = { friendID, fromUserID: mockJwtReqUser2.id };

      await request(app.getHttpServer())
        .post('/friend/friendUpdate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendUpdateDto)
        .expect(201);
    });

    it('파티 생성', async () => {
      const inputPartyCreateDto: PartyCreateDto = {
        name: '파티명',
        friendsID: `["${mockJwtReqUser2.id}"]`,
      };

      const response = await request(app.getHttpServer())
        .post('/party/partyCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPartyCreateDto)
        .expect(201);
      partyID = response.body.id;
    });

    it('플랜 생성', async () => {
      const inputPlanCreateDto: PlanCreateDto = {
        planName: '플랜명',
        placeName: '미진삼겹살',
        placeAddress: '대구 달서구 월성동 1195-1',
        placeLat: 35.8668,
        placeLng: 128.6015,
        date: '2023-11-11T19:30',
        fine: 0,
        partyID,
      };

      const response = await request(app.getHttpServer())
        .post('/plan/planCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPlanCreateDto)
        .expect(201);
      planID = response.body.id;
    });
  });

  describe('User_Location e2e test', () => {
    it('/userLocation/userLocationCreate (Post)', async () => {
      const inputUserLocationCreateDto: UserLocationCreateDto = {
        lat: 12.203,
        lng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: false,
        planID: planID,
      };

      const response = await request(app.getHttpServer())
        .post('/userLocation/userLocationCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputUserLocationCreateDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('lat');
      expect(response.body).toHaveProperty('lng');
      expect(response.body).toHaveProperty('time');
      expect(response.body).toHaveProperty('isArrive');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.lat).toBe(inputUserLocationCreateDto.lat);
      expect(response.body.lng).toBe(inputUserLocationCreateDto.lng);
      expect(response.body.time).toBe(inputUserLocationCreateDto.time);
      expect(response.body.isArrive).toBe(inputUserLocationCreateDto.isArrive);
    });

    it('/userLocation/userLocationFindWithUsersName (Get)', async () => {
      const inputUsersName: string[] = ['Q', 'P'];
      const inputPlanID: string = planID;

      const response = await request(app.getHttpServer())
        .get('/userLocation/userLocationFindWithUsersName')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ usersName: inputUsersName, planID: inputPlanID })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('lat');
      expect(response.body[0]).toHaveProperty('lng');
      expect(response.body[0]).toHaveProperty('time');
      expect(response.body[0]).toHaveProperty('isArrive');
      expect(response.body[0].name).toBe(inputUsersName[1]);
    });
  });
});
