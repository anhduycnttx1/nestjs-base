import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { ImageEntity } from './image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PostEntity, CommentEntity, ImageEntity])],
  exports: [TypeOrmModule.forFeature([UserEntity, PostEntity, CommentEntity, ImageEntity])],
})
export class EntitiesModule {}
