import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>
  ) {}

  async getTagBySlug(slug: string): Promise<TagEntity> {
    return await this.tagRepository.findOne({ where: { slug } });
  }

  async createNewTag(tag: TagEntity): Promise<TagEntity> {
    return await this.tagRepository.save(tag);
  }

  async getTagEntityByArrSlug(tags: string[] | null): Promise<any> {
    const entitys = [];
    if (!tags) return entitys;
    for (const nameTag of tags) {
      const tagOld = await this.getTagBySlug(nameTag.slice(1));
      if (!tagOld) {
        const tag = new TagEntity();
        tag.name = nameTag;
        tag.slug = nameTag.slice(1);
        const newTag = await this.createNewTag(tag);
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
}
