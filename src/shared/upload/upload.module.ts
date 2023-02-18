import { Module } from '@nestjs/common';

import { EntitiesModule } from 'src/entities/entities.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [EntitiesModule],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
