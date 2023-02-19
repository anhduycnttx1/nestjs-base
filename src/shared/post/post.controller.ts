import { Controller, Post, Body, UseGuards, Param, Get, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { DataNotFoundException } from 'src/exceptions';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { IFRsp } from 'src/types';
import { CreatePostDto } from './dto/create-post.dto';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('posts')
  async getPostList(@Query() query: any): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const order = query['order'] || '';
    const direction = query['direction'] || 'asc';
    const title = query['title'] || '';
    const data = await this.postService.getlistPost({
      page,
      perPage,
      direction,
      title,
      order,
    });
    return { code: 200, message: 'ok', data: data };
  }

  @Get('post/:postId')
  async getPostDetail(@Param('postId') postId: string): Promise<IFRsp<any>> {
    const result = await this.postService.getPostById(postId);
    if (!result) throw new DataNotFoundException(`Post id ${postId} not found`);
    return { code: 200, message: 'ok', data: result };
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() body: CreatePostDto, @Req() req: Request): Promise<IFRsp<any>> {
    const userId = req.user['sub'];
    const result = await this.postService.createNewPost(userId, body);
    return { code: 201, message: 'ok', data: result };
  }
}
