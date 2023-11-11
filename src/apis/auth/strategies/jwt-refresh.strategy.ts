import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Payload } from './jwt-access.interface';
import { Request } from 'express';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_KEY,
    });
  }

  validate(payload: Payload) {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
