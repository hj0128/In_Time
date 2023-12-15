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
import { MarkerCreateDto, MarkerDeleteDto } from '../marker.dto';

describe('MarkerController (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;
  let refreshToken: string;

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: '',
    name: 'D',
    email: 'd@d.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
  };
  const mockJwtReqUser2: JwtReqUser['user'] = {
    id: '',
    name: 'E',
    email: 'e@e.com',
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
      name: 'D',
      email: 'd@d.com',
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
      name: 'E',
      email: 'e@e.com',
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

  let friendID: string;
  let partyID: string;
  describe('setting', () => {
    it('E login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'e@e.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('E -> D (친구 신청)', async () => {
      const inputFriendCreateDto: FriendCreateDto = { toUserName: 'D' };

      const response = await request(app.getHttpServer())
        .post('/friend/friendCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputFriendCreateDto)
        .expect(201);
      friendID = response.body.id;
    });

    it('D login', async () => {
      const inputAuthLoginDto: AuthLoginDto = {
        email: 'd@d.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/authLogin')
        .send(inputAuthLoginDto)
        .expect(201);
      accessToken = response.text;
      refreshToken = response.headers['set-cookie'][0].match(/refreshToken=([^;]+)/)[1];
    });

    it('D -> E (친구 수락)', async () => {
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

  describe('Marker e2e test', () => {
    let markerID: string;
    let lat: number;
    let lng: number;
    it('/marker/markerCreate (Post)', async () => {
      const inputMarkerCreateDto: MarkerCreateDto = {
        partyID,
        name: '미진삼겹살',
        address: '대구 달서구 월성동 1195-1',
        lat: 35.8668,
        lng: 128.6015,
      };

      const response = await request(app.getHttpServer())
        .post('/marker/markerCreate')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputMarkerCreateDto)
        .expect(201);
      markerID = response.body.id;
      lat = response.body.lat;
      lng = response.body.lng;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('address');
      expect(response.body).toHaveProperty('lat');
      expect(response.body).toHaveProperty('lng');
      expect(response.body).toHaveProperty('deletedAt');
      expect(response.body.name).toBe(inputMarkerCreateDto.name);
      expect(response.body.address).toBe(inputMarkerCreateDto.address);
      expect(response.body.lat).toBe(inputMarkerCreateDto.lat);
      expect(response.body.lng).toBe(inputMarkerCreateDto.lng);
    });

    it('/marker/markerFindAllWithPartyID (Get)', async () => {
      const inputPartyID: string = partyID;

      const response = await request(app.getHttpServer())
        .get('/marker/markerFindAllWithPartyID')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .query({ partyID: inputPartyID })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('address');
      expect(response.body[0]).toHaveProperty('lat');
      expect(response.body[0]).toHaveProperty('lng');
      expect(response.body[0]).toHaveProperty('deletedAt');
      expect(response.body[0].id).toBe(markerID);
    });

    it('/marker/markerDelete (Delete)', async () => {
      const inputMarkerDeleteDto: MarkerDeleteDto = { partyID, lat, lng };

      await request(app.getHttpServer())
        .delete('/marker/markerDelete')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send(inputMarkerDeleteDto)
        .expect(200);
    });
  });
});
