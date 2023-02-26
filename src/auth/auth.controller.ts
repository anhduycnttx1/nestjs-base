import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IFRsp, IFToken } from 'src/types';
import { JwtAuthGuard } from './auth.guard';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in-password')
  async signInPassword(@Body() loginDto: LoginDto): Promise<IFRsp<IFToken>> {
    const token = await this.authService.login(loginDto);
    return { code: 200, message: 'Login successful', data: token };
  }

  @Post('refresh')
  // @UseGuards(RefreshAuthGuard)
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<IFRsp<IFToken>> {
    const newAccessToken = await this.authService.refreshToken(refreshToken);
    return { code: 200, message: 'ok', data: newAccessToken };
  }

  @Get('sign-out')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request): Promise<IFRsp<any>> {
    const user = req.user;
    await this.authService.logout(user['sub']);
    return { code: 200, message: 'ok' };
  }

  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request): Promise<IFRsp<any>> {
    const user = req.user;
    const data = await this.authService.getMe(user['sub']);
    return { code: 200, message: 'ok', data: data };
  }

  @Post('sign-up')
  async getUserProfile(@Body() signupDto: SignupDto): Promise<IFRsp<IFToken>> {
    const token = await this.authService.signup(signupDto);
    return { code: 200, message: 'ok', data: token };
  }
}
