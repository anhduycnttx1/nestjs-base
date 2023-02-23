import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from 'src/entities/image.entity';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { IFPageRsq } from './../../types/index';
import { PostEntity } from 'src/entities/post.entity';
import { CommentEntity } from './../../entities/comment.entity';
import { UserMetaEntity } from 'src/entities/user_meta.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UserService } from './../user/user.service';
import { PostMetaEntity } from './../../entities/post_meta.entity';
import { TagService } from '../tags/tag.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostMetaEntity)
    private readonly postMetaRepository: Repository<PostMetaEntity>,
    private readonly userService: UserService,
    private readonly tagService: TagService
  ) {}

  async getPostById(postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive AND post.id = :postId', { isActive: true, postId: postId })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', {
        metaPostKey: 'thumbnail_id',
      })
      .leftJoin(ImageEntity, 'image', 'image.id = uuid(pm.metaValue)')
      .leftJoin(CommentEntity, 'comment', 'comment.post = post.id')
      .leftJoin(UserEntity, 'user', 'post.user = user.id')
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'imageAuth', 'imageAuth.id = uuid(um.metaValue)')
      .groupBy('post.id, image.path, imageAuth.path, user.id, user.displayName')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'post.countLike as countlike',
        'image.path as path',
        'imageAuth.path as imageAuthor',
        'user.id as idAuthor',
        'user.displayName as nameAuthor',
      ])
      .addSelect('COUNT(comment.id)', 'commentCount')
      .getRawOne();
    if (!post) return null;
    const tags = await this.tagService.findTagsByPostId(post.id);
    const result = {
      id: post?.id,
      title: post?.title,
      content: post?.content,
      countLike: post?.countlike,
      countComment: Number(post?.commentCount),
      image: post?.path ? `http://localhost:8000/api/posi/v1/${post?.path}` : null,
      release_date: post?.releasedate,
      author: {
        id: post?.idauthor,
        display_name: post?.nameauthor,
        avatar: post?.imageauthor ? `http://localhost:8000/api/posi/v1/${post?.imageauthor}` : null,
      },
      tags: tags[0] ? tags.map((item) => ({ name: item.name, slug: item.slug })) : [],
    };
    return result;
  }

  async getlistPost(query: {
    page?: number;
    perPage?: number;
    order?: string;
    direction?: string;
    title?: string;
  }): Promise<IFPageRsq<any>> {
    const direction = query.direction === 'asc' ? 'DESC' : 'ASC';
    const order = query.order === 'popularity' ? 'post.score' : 'post.createdAt';
    // Cú pháp truy vấn vào cơ sở dữ liệu để lấy thông tin cần thiết
    const queryPost = this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive', { isActive: true })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', { metaPostKey: 'thumbnail_id' })
      .leftJoin(ImageEntity, 'image', 'image.id = uuid(pm.metaValue)')
      .leftJoin(CommentEntity, 'comment', 'comment.post = post.id')
      .leftJoin(UserEntity, 'user', 'post.user = user.id')
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'imageAuth', 'imageAuth.id = uuid(um.metaValue)');
    // xây các hàm bất đồng bộ lấy dữ liệu
    const dataPromis = queryPost
      .groupBy('post.id, image.path, imageAuth.path, user.id, user.displayName')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'post.countLike as countlike',
        'image.path as path',
        'imageAuth.path as imageAuthor',
        'user.id as idAuthor',
        'user.displayName as nameAuthor',
      ])
      .addSelect('COUNT(comment.id)', 'commentCount')
      .limit(query.perPage)
      .orderBy(order, direction)
      .offset((query.page - 1) * query.perPage)
      .getRawMany();
    const countPromise = queryPost.getCount();
    // Chạy bất đồng bộ để lấy dữ liệu
    const [data, count] = await Promise.all([dataPromis, countPromise]);
    //Map dữ liệu về đúng chuẩn cần lấy
    const content = data.map((post: any) => ({
      id: post?.id,
      title: post?.title,
      countLike: post?.countlike,
      countComment: Number(post?.commentCount),
      image: post?.path ? `http://localhost:8000/api/posi/v1/${post?.path}` : null,
      release_date: post?.releasedate,
      author: {
        id: post?.idauthor,
        display_name: post?.nameauthor,
        avatar: post?.imageauthor ? `http://localhost:8000/api/posi/v1/${post?.imageauthor}` : null,
      },
    }));
    return {
      page_index: query.page,
      item_count: query.perPage,
      page_total: Math.ceil(count / query.perPage),
      item_total: count,
      content: content,
    };
  }

  async getlistPostByUser(query: {
    page?: number;
    perPage?: number;
    order?: string;
    direction?: string;
    userId: string;
  }): Promise<IFPageRsq<any>> {
    const direction = query.direction === 'asc' ? 'DESC' : 'ASC';
    const order = query.order === 'popularity' ? 'post.score' : 'post.createdAt';
    // Cú pháp truy vấn vào cơ sở dữ liệu để lấy thông tin cần thiết
    const queryPost = this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive', { isActive: true })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', { metaPostKey: 'thumbnail_id' })
      .leftJoin(ImageEntity, 'image', 'image.id = uuid(pm.metaValue)')
      .leftJoin(CommentEntity, 'comment', 'comment.post = post.id')
      .leftJoin(UserEntity, 'user', 'post.user = user.id')
      .andWhere('user.id = :userId', { userId: query.userId })
      .leftJoin(UserMetaEntity, 'um', 'um.user = user.id AND um.metaKey = :metaKey', { metaKey: 'profile_image' })
      .leftJoin(ImageEntity, 'imageAuth', 'imageAuth.id = uuid(um.metaValue)');
    // xây các hàm bất đồng bộ lấy dữ liệu
    const dataPromis = queryPost
      .groupBy('post.id, image.path, imageAuth.path, user.id, user.displayName')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'post.countLike as countlike',
        'image.path as path',
        'imageAuth.path as imageAuthor',
        'user.id as idAuthor',
        'user.displayName as nameAuthor',
      ])
      .addSelect('COUNT(comment.id)', 'commentCount')
      .limit(query.perPage)
      .orderBy(order, direction)
      .offset((query.page - 1) * query.perPage)
      .getRawMany();
    const countPromise = queryPost.getCount();
    // Chạy bất đồng bộ để lấy dữ liệu
    const [data, count] = await Promise.all([dataPromis, countPromise]);
    //Map dữ liệu về đúng chuẩn cần lấy
    const content = data.map((post: any) => ({
      id: post?.id,
      title: post?.title,
      countLike: post?.countlike,
      countComment: post?.commentCount ? Number(post?.commentCount) : 0,
      image: post?.path ? `http://localhost:8000/api/posi/v1/${post?.path}` : null,
      release_date: post?.releasedate,
      author: {
        id: post?.idauthor,
        display_name: post?.nameauthor,
        avatar: post?.imageauthor ? `http://localhost:8000/api/posi/v1/${post?.imageauthor}` : null,
      },
    }));
    return {
      page_index: query.page,
      item_count: query.perPage,
      page_total: Math.ceil(count / query.perPage),
      item_total: count,
      content: content,
    };
  }
  async createNewPost(userId: string, body: CreatePostDto) {
    const user = await this.userService.findUserByWhere({ id: userId });
    const tags: string[] | null = body.tags.match(/#\w+/g);

    //Tạo post
    const post = new PostEntity();
    post.user = user;
    post.title = body.title;
    post.content = body.content;
    post.tags = await await this.tagService.getTagEntityByArrSlug(tags);
    const postNew = await this.postRepository.save(post);
    //Tạo meta cho post
    if (body.imageId) {
      const meta = new PostMetaEntity();
      meta.post = postNew;
      meta.metaKey = 'thumbnail_id';
      meta.metaValue = body.imageId || '';
      await this.postMetaRepository.save(meta);
    }
    //Tạo tags với post
    return await this.getPostById(postNew.id);
  }
}
