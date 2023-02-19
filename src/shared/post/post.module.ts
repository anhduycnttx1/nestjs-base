import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { PostController } from './post.controller';
import { UserModule } from './../user/user.module';
import { TagModule } from './../tags/tag.module';
@Module({
  imports: [EntitiesModule, UserModule, TagModule],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
