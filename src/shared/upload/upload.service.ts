import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from 'src/entities/image.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>
  ) {}

  async uploadImageToDB(body: {
    imgAuthor: number;
    imgType: string;
    imgPath: string;
    imgName: string;
  }): Promise<ImageEntity> {
    const taxonomy = { user: 'USER_IMAGE', post: 'POST_IMAGE', comment: 'COMMENT_IMAGE' };
    const pathConver = body.imgPath.split('\\').join('/').replace('uploads/', 'public/');
    const image = new ImageEntity();
    image.authorId = body.imgAuthor;
    image.imgName = body.imgName;
    image.path = pathConver;
    image.taxonomy = taxonomy[body.imgType];
    return await this.imageRepository.save(image);
  }
}
