import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtReqUser } from 'src/commons/interface/req.interface';
import { Request, Response } from 'express';
import { AuthLoginDto, AuthSendTokenDto } from '../auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      sendToken: jest.fn(),
      login: jest.fn(),
      socialLogin: jest.fn(),
      restoreAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  const mockReq: Request & JwtReqUser = { user: { id: 'User01' } } as Request & JwtReqUser;

  const mockRes: Response = {} as Response;

  describe('authSendToken', () => {
    it('user에게 인증 번호를 전송한다.', async () => {
      const inputAuthSendTokenDto: AuthSendTokenDto = {
        tokenNumber: '000000',
        phone1: '010',
        phone2: '1234',
        phone3: '5678',
      };

      jest.spyOn(authService, 'sendToken').mockReturnValue(undefined);

      const result: void = await authController.authSendToken(inputAuthSendTokenDto);

      expect(result).toBeUndefined();
      expect(authService.sendToken).toHaveBeenCalledWith({
        authSendTokenDto: inputAuthSendTokenDto,
      });
    });
  });

  describe('authLogin', () => {
    it('로그인에 성공하면 AccessToken을 반환한다.', async () => {
      const inputAuthLoginDot: AuthLoginDto = { email: 'a@a.com', password: '1234' };
      const inputReq: Response = mockRes;

      const expectedLogin: string = 'abcdefg';

      jest.spyOn(authService, 'login').mockResolvedValueOnce(expectedLogin);

      const result: string = await authController.authLogin(inputAuthLoginDot, inputReq);

      expect(result).toEqual(expectedLogin);
      expect(authService.login).toHaveBeenCalledWith({
        authLoginDto: inputAuthLoginDot,
        res: inputReq,
      });
    });
  });

  describe('authSocialLogin', () => {
    it('소셜 로그인한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;
      const inputRes: Response = mockRes;

      const result: void = await authController.authSocialLogin(inputReq, inputRes);

      jest.spyOn(authService, 'socialLogin').mockReturnValue(undefined);

      expect(result).toBeUndefined();
      expect(authService.socialLogin).toHaveBeenCalledWith({
        req: inputReq,
        res: inputRes,
      });
    });
  });

  describe('authRestoreAccessToken', () => {
    it('RefreshToken을 사용하여 AccessToken을 재발급하고, AccessToken을 반환한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedRestoreAccessToken: string = 'aaaaaa';

      jest
        .spyOn(authService, 'restoreAccessToken')
        .mockResolvedValueOnce(Promise.resolve(expectedRestoreAccessToken) as never);

      const result: string = await authController.authRestoreAccessToken(inputReq);

      expect(result).toEqual(expectedRestoreAccessToken);
      expect(authService.restoreAccessToken).toHaveBeenCalledWith({ user: inputReq.user });
    });
  });
});
