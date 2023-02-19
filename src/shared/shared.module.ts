import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tags/tag.module';

@Module({
  imports: [UserModule, UploadModule, PostModule, TagModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
