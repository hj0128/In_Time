import { Test, TestingModule } from '@nestjs/testing';
import { JwtReqUser } from '../../../commons/interface/req.interface';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto, AuthSendTokenDto } from '../auth.dto';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { User } from '../../user/user.entity';
import { Request, Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserService = {
      findOneWithEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockedToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    partyUsers: [],
    friends: [],
  };

  const mockJwtReqUser: JwtReqUser['user'] = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://b.jpg',
  };

  const mockReq: Request & JwtReqUser = { user: { email: '' } } as Request & JwtReqUser;

  const mockRes: Response = {
    cookie: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as Response;

  describe('sendToken', () => {
    it('user에게 인증 번호를 전송한다.', async () => {
      const mockCoolsmsSendOne = jest.fn();

      const inputAuthSendTokenDto: AuthSendTokenDto = {
        tokenNumber: '000000',
        phone1: '010',
        phone2: '1234',
        phone3: '5678',
      };

      jest.spyOn(CoolsmsMessageService.prototype, 'sendOne').mockImplementation(mockCoolsmsSendOne);

      await authService.sendToken({ authSendTokenDto: inputAuthSendTokenDto });

      expect(mockCoolsmsSendOne).toHaveBeenCalledWith({
        to:
          inputAuthSendTokenDto.phone1 +
          inputAuthSendTokenDto.phone2 +
          inputAuthSendTokenDto.phone3,
        from: process.env.COOLSMS_FROM_NUMBER,
        text: `요청하신 인증 번호는 ${inputAuthSendTokenDto.tokenNumber} 입니다.`,
        autoTypeDetect: true,
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
        .mockResolvedValue(Promise.resolve(expectedGetAccessToken) as never);

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

      await authService.setRefreshToken({ user: mockUser, res: mockRes });

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
        { secret: process.env.JWT_ACCESS_KEY, expiresIn: '5s' },
      );
    });
  });

  describe('socialLogin', () => {
    it('소셜 로그인을 처리한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedCreate: User = mockUser;

      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(expectedCreate);
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});

      await authService.socialLogin({ req: inputReq, res: mockRes });

      expect(userService.findOneWithEmail).toHaveBeenCalledWith({ email: inputReq.user.email });
      expect(userService.create).toHaveBeenCalledWith({ userCreateDto: { ...inputReq.user } });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({ user: mockUser, res: mockRes });
    });
  });
});
