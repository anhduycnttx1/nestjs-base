import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ItemType {
  USER = 'user',
  COMMENT = 'comment',
  POST = 'post',
}
export class UploadDto {
  @ApiProperty({
    enum: ItemType,
    enumName: 'ItemType',
  })
  @IsEnum(ItemType)
  type: ItemType;
}
