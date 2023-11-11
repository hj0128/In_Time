import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001/auth/kakao',
      scope: ['profile_nickname', 'account_email', 'profile_image'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      name: profile._json.properties.nickname,
      email: profile._json.kakao_account.email,
      password: '카카오비밀번호',
      profileUrl: profile._json.properties.profile_image,
    };
  }
}
