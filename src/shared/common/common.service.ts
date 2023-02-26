import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './../../entities/user.entity';
import { CommentEntity } from './../../entities/comment.entity';
import { ImageEntity } from 'src/entities/image.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { appendUrlDomain } from 'src/helper';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async getAuthorComment(commentIds: number[]): Promise<any> {
    const authors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(CommentEntity, 'cmt', 'cmt.userId = user.id')
      .where('cmt.id IN (:...commentIds)', { commentIds: commentIds.map((id) => `uuid(${id})`) })
      .leftJoin(UserMetaEntity, 'um', 'um.userId = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'image', 'image.id = uuid(um.metaValue)')
      .select(['imageAuth.path as avatar', 'user.id as id', 'user.displayName as name', 'cmt.id as commentId'])
      .getRawMany();
    const result = {};
    authors.forEach((v: any) => {
      result[v.commentId] = {
        id: v.id,
        display_name: v?.name,
        avatar: v?.avatar ? appendUrlDomain(v?.avatar) : null,
      };
    });
    return result;
  }
}
