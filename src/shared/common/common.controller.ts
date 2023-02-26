import { Controller, Post, Body, UseGuards, Param, Get, Req, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { IFRsp } from 'src/types';

@Controller()
export class CommonController {
  constructor(private readonly conmonService: CommonService) {}

  @Get('upvote/post/:postId')
  @UseGuards(JwtAuthGuard)
  async createPost(@Param('postId') postId: number, @Req() req: Request): Promise<IFRsp<any>> {
    const userId = req.user['sub'];
    await this.conmonService.setUserUpvotePost(userId, Number(postId));
    return { code: 200, message: 'ok' };
  }
}
