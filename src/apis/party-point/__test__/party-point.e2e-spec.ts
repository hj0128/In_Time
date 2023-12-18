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
import { PartyPointUserSendDto } from '../party-point.dto';

describe('Party_PointController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'H',
    email: 'h@h.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'I',
    email: 'i@i.com',
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
      name: 'H',
      email: 'h@h.com',
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
      name: 'I',
      email: 'i@i.com',
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
    it('I login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'i@i.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('I -> H (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'H' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;
    });

    it('H login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'h@h.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('H -> I (친구 수락)', async () => {
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

  describe('Party_Point e2e test', () => {
    it('/partyPoint/partyPointUserSend (Post)', async () => {
      const inputPartyPointUserSendDto: PartyPointUserSendDto = { partyID, amount: 0 };

      const response = await request(app.getHttpServer())
        .post('/partyPoint/partyPointUserSend')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputPartyPointUserSendDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userName');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.userName).toBe(mockJwtReqUser.name);
      expect(response.body.amount).toBe(inputPartyPointUserSendDto.amount);
      expect(response.body.status).toBe('USER_SEND');
      expect(response.body.party.id).toBe(inputPartyPointUserSendDto.partyID);
    });

    it('/partyPoint/partyPointFindWithPartyID (Get)', async () => {
      const inputPartyID: string = partyID;

      const response = await request(app.getHttpServer())
        .get('/partyPoint/partyPointFindWithPartyID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ partyID: inputPartyID })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('userName');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('deletedAt');
    });
  });
});
