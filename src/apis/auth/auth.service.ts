import {
  GoneException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceLogin,
  IAuthServiceLogout,
  IAuthServiceRestoreAccessToken,
  IAuthServiceSendToken,
  IAuthServiceSetRefreshToken,
  IAuthServiceSocialLogin,
  IAuthServiceTokenEXP,
} from './auth.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
  ) {}

  sendToken({ authSendTokenDto }: IAuthServiceSendToken): void {
    const { tokenNumber, email } = authSendTokenDto;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAIL_GMAIL_EMAIL,
        pass: process.env.NODE_MAIL_GMAIL_PASSWORD,
      },
    });

    const html = `
      <div style="max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">In_Time 회원가입을 위한 인증번호 입니다.</h1>
        <p style="color: #555; font-size: 16px;">안녕하세요.</p>
        <p style="color: #555; font-size: 16px;">In_Time 회원가입을 위한 인증번호는 <strong style="font-weight: bold; color: #000; font-size: 20px;">${tokenNumber}</strong> 입니다.</p>
      </div>
  `;

    transporter.sendMail({
      from: process.env.NODE_MAIL_GMAIL_EMAIL,
      to: email,
      subject: 'In_Time 회원가입 인증번호입니다.',
      html,
    });
  }

  async login({ authLoginDto, res }: IAuthServiceLogin): Promise<string> {
    const { email, password } = authLoginDto;

    const user = await this.userService.findOneWithEmail({ email });
    if (!user) throw new UnauthorizedException('회원 가입 되지 않은 이메일입니다.');
    if (user.deletedAt) throw new GoneException('탈퇴한 사용자입니다.');

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
        id: user.id,
        email: user.email,
        name: user.name,
      },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '1w' },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: 'hyeonju.shop',
      path: '/',
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    res.setHeader('Access-Control-Allow-Origin', 'https://hyeonju.shop:3000');
  }

  getAccessToken({ user }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      {
        id: user.id,
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
      user = await this.userService.create({
        userCreateDto: { userEmail: req.user.email, ...req.user },
      });
    }

    if (user.deletedAt) throw new GoneException('탈퇴한 사용자입니다.');

    this.setRefreshToken({ user, res });
  }

  async logout({ headers }: IAuthServiceLogout): Promise<string> {
    const accessToken = headers.authorization.replace('Bearer ', '');
    const refreshToken = headers.cookie.replace('refreshToken=', '');

    try {
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const tokenEXP = this.tokenEXP({ accessToken, refreshToken });
    const accessTokenEXP = tokenEXP[0];
    const refreshTokenEXP = tokenEXP[1];

    await this.cacheManager.set(`accessToken:${accessToken}`, 'accessToken', {
      ttl: accessTokenEXP,
    });

    await this.cacheManager.set(`refreshToken:${refreshToken}`, 'refreshToken', {
      ttl: refreshTokenEXP,
    });

    return '로그아웃에 성공하였습니다.';
  }

  tokenEXP({ accessToken, refreshToken }: IAuthServiceTokenEXP): number[] {
    const accessDecoded = this.jwtService.decode(accessToken);
    const refreshDecoded = this.jwtService.decode(refreshToken);

    const result = [accessDecoded, refreshDecoded].map((el) => {
      return Math.floor((new Date(el['exp'] * 1000).getTime() - new Date().getTime()) / 1000);
    });

    return result;
  }
}
