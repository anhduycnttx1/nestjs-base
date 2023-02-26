import { Module } from '@nestjs/common';
import { CommonService } from './common.service';

import { EntitiesModule } from 'src/entities/entities.module';
import { CommonController } from './common.controller';
import { UserModule } from 'src/shared/user/user.module';
@Module({
  imports: [EntitiesModule, UserModule],
  providers: [CommonService],
  controllers: [CommonController],
  exports: [CommonService],
})
export class CommonModule {}
