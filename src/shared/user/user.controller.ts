import { Controller, Post, Body, UseGuards, Param, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataNotFoundException } from 'src/exceptions';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { IFRsp } from 'src/types';
import { UpAvatarDto } from './dto/up-avatar.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  //@UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string): Promise<IFRsp<any>> {
    const data = await this.userService.getUserProfile(id);
    if (!data) throw new DataNotFoundException(`User id ${id} not found`);
    return { code: 200, message: 'ok', data: data };
  }

  @Post('update/avatar')
  @UseGuards(JwtAuthGuard)
  async updateUserWithAvatar(@Req() req: Request, @Body() { imageId }: UpAvatarDto): Promise<IFRsp<any>> {
    const userId = req.user['sub'];
    const data = await this.userService.updateAvatarUser(imageId);
    if (!data) throw new DataNotFoundException(`User id ${imageId} not found`);
    return { code: 200, message: 'ok', data: data };
  }
}
