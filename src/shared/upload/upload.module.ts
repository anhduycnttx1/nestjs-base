import { Module } from '@nestjs/common';

import { EntitiesModule } from 'src/entities/entities.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [EntitiesModule],
  providers: [],
  controllers: [UploadController],
  exports: [],
})
export class UploadModule {}
