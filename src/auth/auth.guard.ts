import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('access') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return super.canActivate(context);
    }
    const request = context.switchToHttp().getRequest();
    request.user = { roles };
    return super.canActivate(context);
  }
}

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return super.canActivate(context);
    }
    const request = context.switchToHttp().getRequest();
    request.user = { roles };
    return super.canActivate(context);
  }
}

@Injectable()
export class JwtUserGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService, private authService: AuthService) {
    super();
  }

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    const user = await this.authService.getUserByToken(token);

    if (!user) {
      request.user = null;
    }

    request.user = user;

    return true;
  }

  private extractToken(request: any) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }
}
