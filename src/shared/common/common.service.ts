import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './../../entities/user.entity';
import { CommentEntity } from './../../entities/comment.entity';
import { ImageEntity } from 'src/entities/image.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { appendUrlDomain } from 'src/helper';
import { PostEntity } from 'src/entities/post.entity';
import { UserFollowEntity } from './../../entities/user_follow.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserFollowEntity)
    private readonly userFollowRepository: Repository<UserFollowEntity>
  ) {}

  async getAuthorComment(commentIds: number[]): Promise<any> {
    if (!commentIds[0]) return {};
    const authors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(CommentEntity, 'cmt', 'cmt.userId = user.id')
      .where('cmt.id IN (:...commentIds)', { commentIds: commentIds })
      .leftJoin(UserMetaEntity, 'um', 'um.userId = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(um.metaValue AS int)')
      .select([
        'image.path as avatar',
        'user.id as id',
        'user.displayName as name',
        'user.userName as username',
        'cmt.id as cmtid',
      ])
      .getRawMany();
    const result = {};
    authors.forEach((v: any) => {
      result[v.cmtid] = {
        id: v.id,
        username: v.username,
        display_name: v?.name,
        avatar: v?.avatar ? appendUrlDomain(v?.avatar) : null,
      };
    });
    return result;
  }

  async getAuthorPost(postIds: number[]): Promise<any> {
    if (!postIds[0]) return {};
    const authors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(PostEntity, 'post', 'post.userId = user.id')
      .where('post.id IN (:...postIds)', { postIds })
      .leftJoin(UserMetaEntity, 'um', 'um.userId = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(um.metaValue AS int)')
      .select([
        'image.path as avatar',
        'user.id as id',
        'user.displayName as name',
        'user.userName as username',
        'post.id as postId',
      ])
      .getRawMany();
    const result = {};
    authors.forEach((v: any) => {
      result[v.postid] = {
        id: v.id,
        username: v.username,
        display_name: v?.name,
        avatar: v?.avatar ? appendUrlDomain(v?.avatar) : null,
      };
    });
    return result;
  }

  async setUserUpvotePost(userId: number, postId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const follow = new UserFollowEntity();
    follow.user = user;
    follow.type = 'UPVOTE_POST';
    follow.objectId = postId;
    return await this.userFollowRepository.save(follow);
  }
}
