import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

const DYNAMIC_AUTH_GUARD = ['google', 'naver', 'kakao'].reduce((prev, curr) => {
  return { ...prev, [curr]: new (class extends AuthGuard(curr) {})() };
}, {});

export class DynamicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const { social } = context.switchToHttp().getRequest().params;
    return DYNAMIC_AUTH_GUARD[social].canActivate(context);
  }
}
