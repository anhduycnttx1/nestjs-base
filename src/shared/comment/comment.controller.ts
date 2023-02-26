import { Controller, Param, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { IFRsp } from 'src/types';
import { CommentDto } from './comment.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':postId')
  async getCommentByPost(@Param('postId') postId: number): Promise<IFRsp<any>> {
    const result = await this.commentService.getCommentByPostId(postId);
    //if (!result) throw new DataNotFoundException(`Post id ${postId} not found`);
    return { code: 200, message: 'ok', data: result };
  }

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async SetCommentToPost(
    @Param('postId') postId: number,
    @Body() body: CommentDto,
    @Req() req: Request
  ): Promise<IFRsp<any>> {
    const userId = req.user['sub'];
    const result = await this.commentService.createCommentByUser(postId, userId, body.comment);
    return { code: 200, message: 'ok', data: result };
  }
}
