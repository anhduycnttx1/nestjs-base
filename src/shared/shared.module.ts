import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tags/tag.module';
import { CommentModule } from './comment/comment.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [UserModule, UploadModule, PostModule, TagModule, CommentModule, CommonModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
