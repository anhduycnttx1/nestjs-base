import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';
import { UserTagRelationshipsEntity } from './../../entities/user_tags_relationships';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(UserTagRelationshipsEntity)
    private readonly tagRelationshipRepository: Repository<UserTagRelationshipsEntity>
  ) {}

  async getTagBySlug(slug: string): Promise<TagEntity> {
    return await this.tagRepository.findOne({ where: { slug } });
  }

  async createTagByName(name: string): Promise<TagEntity> {
    const tag = new TagEntity();
    tag.name = name;
    tag.slug = name.slice(1);
    return await this.tagRepository.save(tag);
  }

  async setTagEntityByArrSlug(tags: string[] | null): Promise<any> {
    const entitys = [];
    if (!tags) return entitys;
    for (const nameTag of tags) {
      const tagOld = await this.getTagBySlug(nameTag.slice(1));
      if (!tagOld) {
        const newTag = await this.createTagByName(nameTag);
        entitys.push(newTag);
      } else entitys.push(tagOld);
    }
    return entitys;
  }

  async findTagsByPostId(postId: number): Promise<TagEntity[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('post_tags_relationships', 'ptr', 'ptr.tagEntityId = tag.id')
      .where('ptr.postEntityId = :postId', { postId: postId })
      .getMany();
    return tags;
  }

  async findTagBySlug(slug: string): Promise<TagEntity> {
    const tags = await this.tagRepository.findOne({
      where: {
        slug: slug,
      },
    });
    return tags;
  }

  async getTagRelationshipByUser(user: UserEntity): Promise<UserTagRelationshipsEntity[]> {
    return await this.tagRelationshipRepository.find({ where: { userId: user.id } });
  }
}
