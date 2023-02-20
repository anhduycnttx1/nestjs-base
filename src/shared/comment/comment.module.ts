import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { EntitiesModule } from 'src/entities/entities.module';
import { UserModule } from '../user/user.module';
import { TagModule } from '../tags/tag.module';

@Module({
  imports: [EntitiesModule, UserModule, TagModule],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
