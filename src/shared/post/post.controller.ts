import { Controller, Post, Body, UseGuards, Param, Get, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { DataNotFoundException } from 'src/exceptions';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { IFRsp } from 'src/types';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtService } from '@nestjs/jwt';
@Controller()
export class PostController {
  constructor(private readonly postService: PostService, private readonly jwtService: JwtService) {}

  @Post('posts')
  async getPostList(@Query() query: any, @Body('token') token: string): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const order = query['order'] || '';
    const direction = query['direction'] || 'asc';
    const title = query['title'] || '';
    let result = null;
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: 'at-secret' });
      result = await this.postService.getlistPost({
        page,
        perPage,
        direction,
        title,
        order,
        userId: parseInt(payload?.sub),
      });
    } catch (_) {
      result = await this.postService.getlistPost({
        page,
        perPage,
        direction,
        title,
        order,
      });
    }

    return { code: 200, message: 'ok', data: result };
  }
  @Post('posts/user/:userId')
  async getPostListByUser(
    @Query() query: any,
    @Param('userId') userId: number | string,
    @Body('token') token: string
  ): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const order = query['order'] || '';
    const direction = query['direction'] || 'asc';
    let result = null;
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: 'at-secret' });
      result = result = await this.postService.getlistPostByUser({
        page,
        perPage,
        direction,
        userId,
        order,
        userLogin: parseInt(payload?.sub),
      });
    } catch (_) {
      result = await this.postService.getlistPostByUser({
        page,
        perPage,
        direction,
        userId,
        order,
      });
    }

    return { code: 200, message: 'ok', data: result };
  }

  @Post('post/:postId')
  async getPostDetail(@Param('postId') postId: number, @Body('token') token: string): Promise<IFRsp<any>> {
    let result = null;
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: 'at-secret' });
      result = await this.postService.getPostById(postId, Number(payload?.sub));
    } catch (_) {
      result = await this.postService.getPostById(postId);
    }
    if (!result) throw new DataNotFoundException(`Post id ${postId} not found`);
    return { code: 200, message: 'ok', data: result };
  }

  @Post('create/posts')
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() body: CreatePostDto, @Req() req: Request): Promise<IFRsp<any>> {
    const userId = req.user['sub'];
    const result = await this.postService.createNewPost(userId, body);
    return { code: 201, message: 'ok', data: result };
  }
}
