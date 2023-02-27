import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { IFToken } from 'src/types';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/shared/user/user.service';
import { AuthFailedException, UnauthorizedException } from 'src/exceptions';
import { SignupDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { UserEntity } from './../entities/user.entity';
import { isNumberInput } from 'src/helper';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

  async signup(signupDto: SignupDto): Promise<IFToken> {
    const { email, password, username, lastName, firstName } = signupDto;
    // Kiểm tra tính hợp lệ của thông tin đăng nhập
    if (!email || !password) throw new AuthFailedException('email and password are required');
    // Kiểm tra người dùng đã tồn tại trong cơ sở dữ liệu chưa
    const user = await this.userService.findUserByWhere({ userName: username });
    if (user) throw new AuthFailedException(`An account with email ${email} already exists`);
    const displayName = `${firstName} ${lastName}`;
    // Mã hoá password
    const hashed = await argon.hash(password);
    // Tạo User
    const userSignIn = await this.userService.createUser({ hashed, email, displayName, username });
    // Tạo token và trả về cho controller
    const payload = { sub: userSignIn.id, username: userSignIn.userName };
    const token = await this.generateToken(payload);
    // Mã hoá refresh_token và lưu vào database
    const hasedToken = await argon.hash(token.refresh_token);
    await this.userService.updateUser(userSignIn.id, { hashRefresh: hasedToken });
    return token;
  }

  async login(loginDto: LoginDto): Promise<IFToken> {
    const { username, password } = loginDto;
    // Kiểm tra tính hợp lệ của thông tin đăng nhập
    if (!username || !password) throw new AuthFailedException('Username and password are required');
    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await this.userService.findUserByWhere({ userName: username });
    if (!user) throw new AuthFailedException('Incorrect username or password');
    // So sánh mật khẩu
    const isPasswordMatch = await this.comparePassword(password, user.userPass);
    if (!isPasswordMatch) throw new AuthFailedException('Incorrect username or password');
    // Tạo token và trả về cho controller
    const payload = { username: user.userName, sub: user.id };
    const token = await this.generateToken(payload);
    // Mã hoá refresh_token và lưu vào database
    const hasedToken = await argon.hash(token.refresh_token);
    await this.userService.updateUser(user.id, { hashRefresh: hasedToken });
    return token;
  }

  async logout(id: number) {
    const user = await this.userService.findUserByWhere({ id: id });
    await this.userService.updateUser(user.id, { hashRefresh: null });
    return 'logout';
  }

  async refreshToken(refreshToken: string): Promise<IFToken> {
    const playload = await this.jwtService.verifyAsync(refreshToken, { secret: 'rt-secret' });
    const user = await this.userService.findUserByWhere({ id: playload['sub'] });
    if (!user) throw new UnauthorizedException();
    const token = await this.generateToken({ sub: user.id, username: user.userName });
    const hasedToken = await argon.hash(token.refresh_token);
    await this.userService.updateUser(user.id, { hashRefresh: hasedToken });
    return token;
  }

  async validateUser(id: number) {
    const user = await this.userService.findUserByWhere({ id: id });
    if (!user) return null;
    return user;
  }

  async getUserByToken(token: string): Promise<UserEntity> {
    const payload = this.jwtService.decode(token) as { sub: number | string };
    if (!payload) {
      return null;
    }
    let user = null;
    if (isNumberInput(payload.sub)) {
      user = await this.userService.findUserByWhere({ id: payload.sub });
    } else {
      user = await this.userService.findUserByWhere({ userName: payload.sub });
    }
    return user;
  }

  async getMe(id: number) {
    const user = await this.userService.getAuthorLogin(id);
    if (!user) return null;
    return user;
  }

  private async comparePassword(password: string, hashedPassword: string) {
    const checked = await argon.verify(hashedPassword, password);
    return checked;
  }

  private async generateToken(payload: any): Promise<IFToken> {
    const access_token = await this.jwtService.signAsync(payload, { secret: 'at-secret', expiresIn: '15m' });
    const refresh_token = await this.jwtService.signAsync(payload, { secret: 'rt-secret', expiresIn: '7d' });
    return { access_token, refresh_token };
  }
}
