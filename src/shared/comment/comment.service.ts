import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { CommentEntity } from './../../entities/comment.entity';
import { UserService } from './../user/user.service';
import { CommonService } from '../common/common.service';
import { TagService } from './../tags/tag.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly userService: UserService,
    private readonly commonService: CommonService,
    private readonly tagService: TagService
  ) {}

  async getCommentByPostId(postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post is not found');
    const comments = await this.commentRepository
      .createQueryBuilder('comt')
      .leftJoinAndSelect(PostEntity, 'post', 'post.id = comt.postId')
      .where('post.id = :postId', { postId: post.id })
      .select(['comt.id as id', 'comt.content as content', 'comt.createdAt as releasedate'])
      .getRawMany();
    const authors = await this.commonService.getAuthorComment(comments.map((v) => v.id));
    const result = comments.map((item: any) => ({
      id: item.id,
      content: item.content,
      release_date: item.releasedate,
      author: authors ? authors[item?.id] : null,
    }));
    return result;
  }

  async createCommentByUser(postId: number, userId: number, content: string): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post is not found');
    const user = await this.userService.getAuthorLogin(userId);
    // Tạo comment
    const comment = new CommentEntity();
    comment.content = content;
    comment.post = post;
    comment.userId = userId;
    const commentNew = await this.commentRepository.save(comment);
    // Tính điểm post sau khi comment
    post.score = post.score + Math.floor(Math.random() * 5) + 4;
    await this.postRepository.update(post.id, post);
    //Gán tag cho user
    const tagsByPost = await this.tagService.findTagsByPostId(post.id);
    console.log(tagsByPost);
    if (tagsByPost && tagsByPost[0])
      await this.userService.setTagWithUser(
        user.id,
        tagsByPost.map((v) => v.name)
      );
    const authors = await this.commonService.getAuthorComment([commentNew.id]);
    return {
      id: commentNew.id,
      content: commentNew.content,
      release_date: commentNew.createdAt,
      author: authors ? authors[commentNew?.id] : null,
    };
  }
}
