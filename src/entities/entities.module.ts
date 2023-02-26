import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { ImageEntity } from './image.entity';
import { CommentMetaEntity } from './comment_meta.entity';
import { TagEntity } from './tag.entity';
import { PostMetaEntity } from './post_meta.entity';
import { UserMetaEntity } from './user_meta.entity';
import { UserTagRelationshipsEntity } from './user_tags_relationships';
import { UserFollowEntity } from './user_follow.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PostEntity,
      CommentEntity,
      ImageEntity,
      CommentMetaEntity,
      TagEntity,
      PostMetaEntity,
      UserMetaEntity,
      UserTagRelationshipsEntity,
      UserFollowEntity,
    ]),
  ],
  exports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PostEntity,
      CommentEntity,
      ImageEntity,
      CommentMetaEntity,
      TagEntity,
      PostMetaEntity,
      UserMetaEntity,
      UserTagRelationshipsEntity,
      UserFollowEntity,
    ]),
  ],
})
export class EntitiesModule {}
