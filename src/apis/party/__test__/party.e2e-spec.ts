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
import { FriendCreateDto, FriendUpdateDto } from '../../friend/friend.dto';
import {
  FindOneWithPartyIDDto,
  PartyCreateDto,
  PartyDeleteDto,
  PartySoftDeleteDto,
  PartyUpdateAndUserAndPlanDto,
} from 'src/apis/party/party.dto';
import { PlanCreateDto } from 'src/apis/plan/plan.dto';

describe('PartyController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'F',
    email: 'f@f.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'G',
    email: 'g@g.com',
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
      name: 'F',
      email: 'f@f.com',
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
      name: 'G',
      email: 'g@g.com',
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
    let friendID: string;
    it('G login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'g@g.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('G -> F (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'F' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;
    });

    it('F login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'f@f.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('F -> G (친구 수락)', async () => {
      const inputFriendUpdateDto: FriendUpdateDto = { friendID, fromUserID: mockJwtReqUser2.id };

      await request(app.getHttpServer())
        .post('/friend/friendUpdate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendUpdateDto)
        .expect(201);
    });
  });

  let partyID: string;
  describe('Party e2e test', () => {
    it('/party/partyCreate', async () => {
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

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('point');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.name).toBe(inputPartyCreateDto.name);
    });
  });

  let planID: string;
  describe('setting', () => {
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

  describe('Party e2e test', () => {
    it('/party/partyFindAll (Get)', async () => {
      const response = await request(app.getHttpServer())
        .get('/party/partyFindAll')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('partyID');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('point');
      expect(response.body[0]).toHaveProperty('members');
      expect(response.body[0].partyID).toBe(partyID);
    });

    it('/party/partyFindOneWithPartyID (Get)', async () => {
      const inputFindOneWithPartyIDDto: FindOneWithPartyIDDto = { partyID };

      const response = await request(app.getHttpServer())
        .get('/party/partyFindOneWithPartyID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ findOneWithPartyIDDto: inputFindOneWithPartyIDDto })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('point');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.id).toBe(partyID);
    });

    it('/party/partyUpdateAndUserAndPlan (Post)', async () => {
      const inputPartyUpdateAndUserAndPlanDto: PartyUpdateAndUserAndPlanDto = {
        partyID,
        planID,
        users: ['F'],
      };

      await request(app.getHttpServer())
        .post('/party/partyUpdateAndUserAndPlan')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPartyUpdateAndUserAndPlanDto)
        .expect(201);
    });

    it('/party/partySoftDelete (Delete)', async () => {
      const inputPartySoftDeleteDto: PartySoftDeleteDto = { partyID };

      await request(app.getHttpServer())
        .delete('/party/partySoftDelete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPartySoftDeleteDto)
        .expect(200);
    });

    it('/party/partyDelete (Delete)', async () => {
      const inputPartyDeleteDto: PartyDeleteDto = { partyID };

      await request(app.getHttpServer())
        .delete('/party/partyDelete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPartyDeleteDto)
        .expect(200);
    });
  });
});
