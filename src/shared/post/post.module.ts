import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { PostController } from './post.controller';

@Module({
  imports: [EntitiesModule],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
