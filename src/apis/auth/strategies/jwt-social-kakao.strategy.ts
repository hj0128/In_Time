import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: 'http://hyeonju.shop/auth/kakao',
      scope: ['profile_nickname', 'account_email', 'profile_image'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      name: profile._json.properties.nickname,
      email: profile._json.kakao_account.email,
      password: process.env.SOCIAL_PASSWORD,
      profileUrl: profile._json.properties.profile_image,
    };
  }
}
