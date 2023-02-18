import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { UserController } from './user.controller';

@Module({
  imports: [EntitiesModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
