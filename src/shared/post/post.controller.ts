import { Controller, Post, Body, UseGuards, Param, Get, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { DataNotFoundException } from 'src/exceptions';
import { PostService } from './post.service';
import { JwtAuthGuard, JwtUserGuard } from 'src/auth/auth.guard';
import { IFRsp } from 'src/types';
import { CreatePostDto } from './dto/create-post.dto';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('posts')
  @UseGuards(JwtUserGuard)
  async getPostList(@Query() query: any, @Req() request: Request): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const order = query['order'] || 'title';
    const direction = query['direction'] || 'desc';
    const title = query['title'] || null;
    const input = { page, perPage, direction, order, title };
    let result = null;
    if (request.user) {
      result = await this.postService.getPosts({ ...input, userLoginId: request.user['id'] });
    } else {
      result = await this.postService.getPosts(input);
    }
    return { code: 200, message: 'ok', data: result };
  }

  @Get('posts/feed')
  @UseGuards(JwtAuthGuard)
  async getPostsFeed(@Query() query: any, @Req() request: Request): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const input = { page, perPage };
    const result = await this.postService.getFeedsPosts({ ...input, userLoginId: request.user['sub'] });
    return { code: 200, message: 'ok', data: result };
  }

  @Get('posts/user/:memberId')
  @UseGuards(JwtUserGuard)
  async getPostListByUser(
    @Query() query: any,
    @Param('memberId') memberId: number,
    @Req() request: Request
  ): Promise<IFRsp<any>> {
    const page = Number(query['page-index']) || 1;
    const perPage = Number(query['page-size']) || 20;
    const order = query['order'] || 'title';
    const direction = query['direction'] || 'asc';
    const title = query['title'] || null;
    const input = { page, perPage, direction, memberId, order, title };
    let result = null;
    if (request.user) {
      result = await this.postService.getPosts({ ...input, userLoginId: request.user['id'] });
    } else {
      result = await this.postService.getPosts(input);
    }
    return { code: 200, message: 'ok', data: result };
  }

  @Get('post/details/:postId')
  @UseGuards(JwtUserGuard)
  async getPostDetail(@Param('postId') postId: number, @Req() request: Request): Promise<IFRsp<any>> {
    let result = null;
    if (request.user) {
      result = await this.postService.getPostById(postId, request.user['id']);
    } else {
      result = await this.postService.getPostById(postId);
    }
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

  @Post('post/delete/:postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('postId') postId: number, @Req() request: Request): Promise<IFRsp<any>> {
    const result = await this.postService.getPostById(postId, request.user['id']);
    if (!result) throw new DataNotFoundException(`Post id ${postId} not found`);
    return { code: 200, message: 'ok', data: result };
  }
}
