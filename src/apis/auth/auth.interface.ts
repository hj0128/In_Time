import { Request, Response } from 'express';
import { User } from '../user/user.entity';
import { AuthLoginDto, AuthSendTokenDto } from './auth.dto';
import { JwtReqUser } from 'src/commons/interface/req.interface';

export interface IAuthServiceSendToken {
  authSendTokenDto: AuthSendTokenDto;
}

export interface IAuthServiceLogin {
  authLoginDto: AuthLoginDto;
  res: Response;
}

export interface IAuthServiceRestoreAccessToken {
  user: JwtReqUser['user'];
}

export interface IAuthServiceSetRefreshToken {
  user: User;
  res: Response;
}

export interface IAuthServiceGetAccessToken {
  user: User | JwtReqUser['user'];
}

export interface IAuthServiceSocialLogin {
  req: Request & JwtReqUser;
  res: Response;
}
