import { Body, Controller, Get, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto, AuthSendTokenDto } from './auth.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { DynamicAuthGuard } from './guards/social-auth.guard';
import { JwtReqUser } from './auth.interface';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @ApiOperation({
    summary: 'user에게 인증 번호 전송',
    description: '회원가입을 위해 user의 휴대폰에 인증 번호를 전송한다.',
  })
  @Post('/authSendToken')
  authSendToken(
    @Body() authSendTokenDto: AuthSendTokenDto, //
  ): Promise<void> {
    return this.authService.sendToken({ authSendTokenDto });
  }

  @ApiOperation({
    summary: '로그인하기',
    description: '입력 받은 email과 password가 DB의 user 정보와 같다면 로그인한다.',
  })
  @Post('/authLogin')
  authLogin(
    @Body() authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response, //
  ): Promise<string> {
    return this.authService.login({ authLoginDto, res });
  }

  @ApiOperation({
    summary: '소셜 로그인하기',
    description: '구글, 카카오, 네이버로 로그인한다.',
  })
  @UseGuards(DynamicAuthGuard)
  @Redirect('/')
  @Get('/:social')
  authSocialLogin(
    @Req() req: Request & JwtReqUser,
    @Res() res: Response, //
  ): Promise<void> {
    return this.authService.socialLogin({ req, res });
  }

  @ApiOperation({
    summary: 'AccessToken 재발급',
    description: 'RefreshToken을 사용하여 AccessToken을 재발급 받는다.',
  })
  @UseGuards(AuthGuard('refresh'))
  @Post('/restoreAccessToken')
  authRestoreAccessToken(
    @Req() req: JwtReqUser, //
  ) {
    return this.authService.restoreAccessToken({ user: req.user });
  }
}
