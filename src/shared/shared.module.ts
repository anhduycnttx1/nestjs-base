import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tags/tag.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [UserModule, UploadModule, PostModule, TagModule, CommentModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
