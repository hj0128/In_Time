import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Payload } from './jwt-access.interface';
import { Request } from 'express';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() // @Inject(CACHE_MANAGER)
  // private readonly cacheManager: Cache, //
  {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_KEY,
      // passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Payload) {
    // const refreshToken = req.headers.cookie.replace('refreshToken=', '');

    // const isRefreshToken = await this.cacheManager.get(`refreshToken:${refreshToken}`);
    // if (isRefreshToken === 'refreshToken') {
    //   throw new UnauthorizedException('로그아웃 되었습니다.');
    // }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  }
}
