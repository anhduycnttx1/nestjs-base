import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [UserModule, UploadModule, PostModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
