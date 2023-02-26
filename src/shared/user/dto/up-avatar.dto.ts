import { IsNotEmpty } from 'class-validator';

export class UpAvatarDto {
  @IsNotEmpty()
  imageId: number;
}
