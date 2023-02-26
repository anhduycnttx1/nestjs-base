import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { UserController } from './user.controller';
import { TagModule } from '../tags/tag.module';

@Module({
  imports: [EntitiesModule, TagModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
