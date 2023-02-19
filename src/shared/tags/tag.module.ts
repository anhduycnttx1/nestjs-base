import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { TagController } from './tag.controller';

@Module({
  imports: [EntitiesModule],
  providers: [TagService],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
