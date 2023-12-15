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
import { PartyCreateDto, PartyDeleteDto } from 'src/apis/party/party.dto';
import { PlanCreateDto, PlanSoftDeleteDto } from '../plan.dto';

describe('PlanController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'L',
    email: 'l@l.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'M',
    email: 'm@m.com',
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
      name: 'L',
      email: 'l@l.com',
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
      name: 'M',
      email: 'm@m.com',
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
  describe('setting', () => {
    let friendID: string;
    it('M login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'm@m.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('M -> L (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'L' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;
    });

    it('L login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'l@l.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('L -> M (친구 수락)', async () => {
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
  });

  describe('Plan e2e test', () => {
    let planID: string;
    it('/plan/planCreate (Post)', async () => {
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

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('planName');
      expect(response.body).toHaveProperty('placeName');
      expect(response.body).toHaveProperty('placeAddress');
      expect(response.body).toHaveProperty('placeLat');
      expect(response.body).toHaveProperty('placeLng');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('fine');
      expect(response.body).toHaveProperty('isEnd');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.planName).toBe(inputPlanCreateDto.planName);
      expect(response.body.placeName).toBe(inputPlanCreateDto.placeName);
      expect(response.body.placeAddress).toBe(inputPlanCreateDto.placeAddress);
      expect(response.body.placeLat).toBe(inputPlanCreateDto.placeLat);
      expect(response.body.placeLng).toBe(inputPlanCreateDto.placeLng);
      expect(response.body.date).toBe(inputPlanCreateDto.date);
      expect(response.body.fine).toBe(inputPlanCreateDto.fine);
      expect(response.body.party.id).toBe(inputPlanCreateDto.partyID);
    });

    it('/plan/planFindOneWithPlanID (Get)', async () => {
      const inputPlanID: string = planID;

      const response = await request(app.getHttpServer())
        .get('/plan/planFindOneWithPlanID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ planID: inputPlanID })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('planName');
      expect(response.body).toHaveProperty('placeName');
      expect(response.body).toHaveProperty('placeAddress');
      expect(response.body).toHaveProperty('placeLat');
      expect(response.body).toHaveProperty('placeLng');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('fine');
      expect(response.body).toHaveProperty('isEnd');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.id).toBe(inputPlanID);
    });

    it('/plan/planFindWithPartyID (Get)', async () => {
      const inputPartyID: string = partyID;

      const response = await request(app.getHttpServer())
        .get('/plan/planFindWithPartyID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ partyID: inputPartyID })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('planName');
      expect(response.body[0]).toHaveProperty('placeName');
      expect(response.body[0]).toHaveProperty('placeAddress');
      expect(response.body[0]).toHaveProperty('placeLat');
      expect(response.body[0]).toHaveProperty('placeLng');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('fine');
      expect(response.body[0]).toHaveProperty('isEnd');
      expect(response.body[0]).toHaveProperty('deletedAt');
    });

    it('/plan/planFindWithUserIDAndPartyID (Get)', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan/planFindWithUserIDAndPartyID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('planName');
      expect(response.body[0]).toHaveProperty('placeName');
      expect(response.body[0]).toHaveProperty('placeAddress');
      expect(response.body[0]).toHaveProperty('placeLat');
      expect(response.body[0]).toHaveProperty('placeLng');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('fine');
      expect(response.body[0]).toHaveProperty('isEnd');
      expect(response.body[0]).toHaveProperty('deletedAt');
    });

    it('/plan/planSoftDelete (Delete)', async () => {
      const inputPlanSoftDeleteDto: PlanSoftDeleteDto = { planID };

      await request(app.getHttpServer())
        .delete('/plan/planSoftDelete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPlanSoftDeleteDto)
        .expect(200);
    });
  });
});
