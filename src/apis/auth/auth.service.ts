import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceLogin,
  IAuthServiceRestoreAccessToken,
  IAuthServiceSendToken,
  IAuthServiceSetRefreshToken,
  IAuthServiceSocialLogin,
} from './auth.interface';
import coolsms from 'coolsms-node-sdk';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async sendToken({ authSendTokenDto }: IAuthServiceSendToken): Promise<void> {
    const { tokenNumber, phone1, phone2, phone3 } = authSendTokenDto;

    const messageService = new coolsms('NCS63N0TGAOWEGPI', 'JAB6TSDVZGPOCRGMMGLBXMAB1NRQ8ONO');

    await messageService.sendOne({
      to: phone1 + phone2 + phone3,
      from: process.env.COOLSMS_FROM_NUMBER,
      text: `요청하신 인증 번호는 ${tokenNumber} 입니다.`,
      autoTypeDetect: true,
    });
  }

  async login({ authLoginDto, res }: IAuthServiceLogin): Promise<string> {
    const { email, password } = authLoginDto;

    const user = await this.userService.findOneWithEmail({ email });
    if (!user) throw new UnauthorizedException('회원 가입 되지 않은 이메일입니다.');

    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    this.setRefreshToken({ user, res });

    return this.getAccessToken({ user });
  }

  restoreAccessToken({ user }: IAuthServiceRestoreAccessToken): string {
    return this.getAccessToken({ user });
  }

  setRefreshToken({ user, res }: IAuthServiceSetRefreshToken): void {
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.localhost',
      path: '/',
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  }

  getAccessToken({ user }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '1h' },
    );
  }

  async socialLogin({ req, res }: IAuthServiceSocialLogin): Promise<void> {
    let user = await this.userService.findOneWithEmail({
      email: req.user.email,
    });

    if (!user) {
      user = await this.userService.create({ userCreateDto: { ...req.user } });
    }

    this.setRefreshToken({ user, res });
  }
}
