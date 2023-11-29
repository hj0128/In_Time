import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './jwt-access.interface';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache, //
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Payload) {
    const accessToken = req.headers.authorization.replace('Bearer ', '');

    const isAccessToken = await this.cacheManager.get(`accessToken:${accessToken}`);
    if (isAccessToken === 'accessToken') {
      throw new UnauthorizedException('로그아웃 되었습니다.');
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  }
}
