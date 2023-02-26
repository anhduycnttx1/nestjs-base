import { Module } from '@nestjs/common';
import { CommonService } from './common.service';

import { EntitiesModule } from 'src/entities/entities.module';
import { CommonController } from './common.controller';

@Module({
  imports: [EntitiesModule],
  providers: [CommonService],
  controllers: [CommonController],
  exports: [CommonService],
})
export class CommonModule {}
