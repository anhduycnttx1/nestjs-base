import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from 'src/entities/image.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    @InjectRepository(UserMetaEntity)
    private readonly userMetaRepository: Repository<UserMetaEntity>
  ) {}

  async uploadImageToDB(body: {
    imgAuthor: string;
    imgType: string;
    imgPath: string;
    imgName: string;
  }): Promise<ImageEntity> {
    const taxonomy = { user: 'USER_IMAGE', post: 'POST_IMAGE', comment: 'COMMENT_IMAGE' };
    const image = new ImageEntity();
    image.authorId = body.imgAuthor;
    image.imgName = body.imgName;
    image.path = body.imgPath;
    image.taxonomy = taxonomy[body.imgType];
    return await this.imageRepository.save(image);
  }
}
