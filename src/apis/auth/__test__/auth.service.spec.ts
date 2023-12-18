import { Test, TestingModule } from '@nestjs/testing';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto, AuthSendTokenDto } from '../auth.dto';
import { User } from '../../user/user.entity';
import { Request, Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import * as jwt from 'jsonwebtoken';
import { IncomingHttpHeaders } from 'http';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockUserService = { findOneWithEmail: jest.fn(), create: jest.fn() };
    const mockJwtService = { sign: jest.fn().mockReturnValue('mockedToken'), decode: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get<any>(CACHE_MANAGER);
  });

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'http://a.jpg',
  };
  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
    userLocations: [],
  };
  const mockRes: Response = {
    cookie: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as Response;

  describe('sendToken', () => {
    it('user에게 인증 번호를 전송한다.', async () => {
      const sendMailSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({}),
      } as any);

      const inputAuthSendTokenDto: AuthSendTokenDto = { email: 'a@a.com', tokenNumber: '000000' };

      const result: void = authService.sendToken({ authSendTokenDto: inputAuthSendTokenDto });

      expect(result).toBeUndefined();
      expect(sendMailSpy).toHaveBeenCalledWith({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODE_MAIL_GMAIL_EMAIL,
          pass: process.env.NODE_MAIL_GMAIL_PASSWORD,
        },
      });
    });
  });

  describe('login', () => {
    const inputAuthLoginDto: AuthLoginDto = { email: 'a@a.com', password: '1234' };
    const inputRes: Response = mockRes;

    it('존재하지 않는 email이면 UnauthorizedException을 발생시킨다.', async () => {
      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(null);

      try {
        await authService.login({ authLoginDto: inputAuthLoginDto, res: inputRes });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }

      expect(userService.findOneWithEmail).toHaveBeenCalledWith({ email: inputAuthLoginDto.email });
    });

    it('일치하지 않는 비밀번호이면 UnauthorizedException을 발생시킨다.', async () => {
      const expectedFindOneWithEmail: User = mockUser;

      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(expectedFindOneWithEmail);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(false) as never);

      try {
        await authService.login({ authLoginDto: inputAuthLoginDto, res: inputRes });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }

      expect(userService.findOneWithEmail).toHaveBeenCalledWith({ email: inputAuthLoginDto.email });
    });

    it('로그인에 성공하면 AccessToken을 반환한다.', async () => {
      const expectedFindOneWithEmail: User = mockUser;
      const expectedGetAccessToken: string = 'abcdefg';

      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(expectedFindOneWithEmail);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(true) as never);
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});
      jest
        .spyOn(authService, 'getAccessToken')
        .mockResolvedValue(Promise.resolve(expectedGetAccessToken) as never);

      const result: string = await authService.login({
        authLoginDto: inputAuthLoginDto,
        res: inputRes,
      });

      expect(result).toEqual(expectedGetAccessToken);
      expect(userService.findOneWithEmail).toHaveBeenCalledWith({
        email: inputAuthLoginDto.email,
      });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({
        user: mockUser,
        res: inputRes,
      });
    });
  });

  describe('restoreAccessToken', () => {
    it('AccessToken을 새로 반환한다.', async () => {
      const inputUser: JwtReqUser['user'] = mockJwtReqUser;

      const expectedGetAccessToken: string = 'aaaaaa';

      jest
        .spyOn(authService, 'getAccessToken')
        .mockReturnValue(Promise.resolve(expectedGetAccessToken) as never);

      const result: string = await authService.restoreAccessToken({ user: inputUser });

      expect(result).toEqual(expectedGetAccessToken);
      expect(authService.getAccessToken).toHaveBeenCalledWith({ user: inputUser });
    });
  });

  describe('setRefreshToken', () => {
    it('RefreshToken을 생성하여 쿠키에 추가한다.', async () => {
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(0);

      jest.spyOn(jwtService, 'sign');
      jest.spyOn(mockRes, 'setHeader');

      authService.setRefreshToken({ user: mockUser, res: mockRes });

      expect(jwtService.sign).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'mockedToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.localhost',
        path: '/',
        expires: new Date(14 * 24 * 60 * 60 * 1000),
      });

      Date.now = originalDateNow;
    });
  });

  describe('getAccessToken', () => {
    it('AccessToken을 생성한다.', async () => {
      const inputUser = mockUser;

      jest.spyOn(jwtService, 'sign').mockReturnValue('mockedToken');

      const result = authService.getAccessToken({ user: inputUser });

      expect(result).toEqual('mockedToken');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          id: inputUser.id,
          email: inputUser.email,
          name: inputUser.name,
        },
        { secret: process.env.JWT_ACCESS_KEY, expiresIn: '1h' },
      );
    });
  });

  describe('socialLogin', () => {
    it('소셜 로그인을 처리한다.', async () => {
      const inputReq: Request & JwtReqUser = { user: mockJwtReqUser } as Request & JwtReqUser;

      const expectedCreate: User = mockUser;

      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(expectedCreate);
      jest.spyOn(userService, 'create').mockResolvedValue(expectedCreate);
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});

      await authService.socialLogin({ req: inputReq, res: mockRes });

      expect(userService.findOneWithEmail).toHaveBeenCalledWith({ email: inputReq.user.email });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({ user: mockUser, res: mockRes });
    });
  });

  describe('logout', () => {
    it('유효한 토큰을 제공하면 로그아웃에 성공하고 메시지를 반환한다.', async () => {
      const inputHeaders: IncomingHttpHeaders = {
        authorization: 'Bearer validAccessToken',
        cookie: 'refreshToken=validRefreshToken',
      };

      jest.spyOn(jwt, 'verify').mockResolvedValue({} as never);
      jest.spyOn(authService, 'tokenEXP').mockResolvedValue([1, 2] as never);
      jest.spyOn(cacheManager, 'set').mockResolvedValue('accessToken');
      jest.spyOn(cacheManager, 'set').mockResolvedValue('refreshToken');

      const result: string = await authService.logout({
        headers: inputHeaders,
      });

      expect(result).toEqual('로그아웃에 성공하였습니다.');
    });
  });

  describe('tokenEXP', () => {
    it('토큰의 만료 시간을 배열로 반환한다.', async () => {
      const accessDecoded = { exp: Math.floor(new Date().getTime() / 1000) + 3600 };
      const refreshDecoded = { exp: Math.floor(new Date().getTime() / 1000) + 86400 };

      jest.spyOn(jwtService, 'decode').mockReturnValueOnce(accessDecoded as any);
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce(refreshDecoded as any);

      const result = authService.tokenEXP({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      expect(result).toHaveLength(2);

      expect(result[0]).toEqual(expect.any(Number));
      expect(result[1]).toEqual(expect.any(Number));
    });
  });
});
