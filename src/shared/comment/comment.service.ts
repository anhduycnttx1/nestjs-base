import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';

import { Repository } from 'typeorm';
import { CommentEntity } from './../../entities/comment.entity';
import { UserService } from './../user/user.service';
import { UserEntity } from './../../entities/user.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { ImageEntity } from 'src/entities/image.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly userService: UserService
  ) {}

  async getCommentByPostId(postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post is not found');
    const comments = await this.commentRepository
      .createQueryBuilder('comt')
      .leftJoinAndSelect(PostEntity, 'post', 'post.id = comt.postId')
      .leftJoin(UserEntity, 'user', 'uuid(comt.userId) = user.id')
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'imageAuth', 'imageAuth.id = uuid(um.metaValue)')
      .where('post.id = :postId', { postId: post.id })
      .select([
        'comt.id as id',
        'comt.content as content',
        'comt.createdAt as releasedate',
        'imageAuth.path as avatar',
        'user.id as idAuthor',
        'user.displayName as nameAuthor',
      ])
      .getRawMany();
    const result = comments.map((item: any) => ({
      id: item.id,
      content: item.content,
      release_date: item.releasedate,
      author: {
        id: item?.idauthor,
        display_name: item?.nameauthor,
        avatar: item?.avatar ? `http://localhost:8000/api/posi/v1/${item?.avatar}` : null,
      },
    }));
    return result;
  }

  async createCommentByUser(postId: string, userId: string, content: string): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post is not found');
    const user = await this.userService.getAuthorLogin(userId);
    const comment = new CommentEntity();
    comment.content = content;
    comment.post = post;
    comment.userId = userId;
    const commentNew = await this.commentRepository.save(comment);
    post.score = post.score + Math.floor(Math.random() * 5) + 4;
    await this.postRepository.update(post.id, post);
    return {
      id: commentNew.id,
      content: commentNew.content,
      release_date: commentNew.createdAt,
      author: {
        id: user?.id,
        display_name: user?.display_name,
        avatar: user?.avatar,
      },
    };
  }
}
