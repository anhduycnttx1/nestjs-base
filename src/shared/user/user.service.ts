import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { ImageEntity } from 'src/entities/image.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
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

  async updateAvatarUser(userId: string): Promise<any> {
    return 'done';
  }

  async getUserProfile(userId: string): Promise<any> {
    const author = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(UserMetaEntity, 'um2', 'um2.user = user.id AND um2.metaKey = :metaKey', { metaKey: 'profile_banner' })
      .where('user.id = :userId', { userId })
      .leftJoin(ImageEntity, 'imageAvatar', 'imageAvatar.id = uuid(um.metaValue)')
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
    return author;
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
        'image.path as avatar',
      ])
      .getRawOne();
    return author;
  }
  async findUserByWhere(where: any): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: where });
    return user;
  }

  async updateUser(id: string, newData: Partial<UserEntity>): Promise<any> {
    return await this.userRepository.update(id, newData);
  }
}
