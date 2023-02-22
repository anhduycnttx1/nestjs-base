import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { ImageEntity } from 'src/entities/image.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserMetaEntity)
    private readonly userMetaRepository: Repository<UserMetaEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>
  ) {}

  async createUser(data: any): Promise<UserEntity> {
    const { email, displayName, hashed, username } = data;
    const user = {
      userName: username,
      userEmail: email,
      displayName: displayName,
      userPass: hashed,
    };
    return await this.userRepository.save(user);
  }

  async updateAvatarUser(body: { userId: string; imageId: string }): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: body.userId } });
    if (!user) return null;
    const image = await this.imageRepository.findOne({ where: { id: body.imageId } });
    if (!image) throw new BadRequestException('Image not found!');
    const metafind = await this.userMetaRepository.findOne({
      where: { metaKey: 'profile_image', user: { id: body.userId } },
    });
    if (metafind) {
      await this.userMetaRepository.update({ id: metafind.id }, { metaValue: image.id });
      return { mid: metafind.id };
    }
    const meta = new UserMetaEntity();
    meta.user = user;
    meta.metaKey = 'profile_image';
    meta.metaValue = image.id;
    const metaCreate = await this.userMetaRepository.save(meta);
    return { mid: metaCreate.id };
  }

  async updateBannerUser(body: { userId: string; imageId: string }): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: body.userId } });
    if (!user) return null;
    const image = await this.imageRepository.findOne({ where: { id: body.imageId } });
    if (!image) throw new BadRequestException('Image not found!');
    const metafind = await this.userMetaRepository.findOne({
      where: { metaKey: 'profile_banner', user: { id: body.userId } },
    });
    if (metafind) {
      await this.userMetaRepository.update({ id: metafind.id }, { metaValue: image.id });
      return { mid: metafind.id };
    }
    const meta = new UserMetaEntity();
    meta.user = user;
    meta.metaKey = 'profile_banner';
    meta.metaValue = image.id;
    const metaCreate = await this.userMetaRepository.save(meta);
    return { mid: metaCreate.id };
  }

  async getUserProfile(userId: string): Promise<any> {
    const author = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaAvatarKey', {
        metaAvatarKey: 'profile_image',
      })
      .leftJoin(ImageEntity, 'imageAvatar', 'imageAvatar.id = uuid(um.metaValue)')
      .leftJoin(UserMetaEntity, 'um2', 'um2.user = user.id AND um2.metaKey = :metaBannerKey', {
        metaBannerKey: 'profile_banner',
      })
      .leftJoin(ImageEntity, 'imageBanner', 'imageBanner.id = uuid(um2.metaValue)')
      .select([
        'user.id as id',
        'user.userName as username',
        'user.userEmail as email',
        'user.displayName as display_name ',
        'imageAvatar.path as avatar',
        'imageBanner.path as banner',
      ])
      .getRawOne();
    return {
      ...author,
      avatar: author?.avatar ? `http://localhost:8000/api/posi/v1/${author?.avatar}` : null,
      banner: author?.banner ? `http://localhost:8000/api/posi/v1/${author?.banner}` : null,
    };
  }
  async getAuthorLogin(userId: string): Promise<any> {
    const author = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .where('user.id = :userId', { userId })
      .leftJoin(ImageEntity, 'image', 'image.id = uuid(um.metaValue)')
      .select([
        'user.id as id',
        'user.userName as username',
        'user.userEmail as email',
        'user.displayName as display_name ',
        'image.path as path',
      ])
      .getRawOne();
    return { ...author, avatar: author?.path ? `http://localhost:8000/api/posi/v1/${author?.path}` : null };
  }
  async findUserByWhere(where: any): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: where });
    return user;
  }

  async updateUser(id: string, newData: Partial<UserEntity>): Promise<any> {
    return await this.userRepository.update(id, newData);
  }

  async getTagWithUser(userId: string, tags: string[]): Promise<any> {
    const user = this.userRepository.findOne({ where: { id: userId } });
    console.log(user);
    return 'done';
  }
}
