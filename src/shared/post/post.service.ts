import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from 'src/entities/image.entity';
import { Repository } from 'typeorm';
import { IFPageRsq } from './../../types/index';
import { PostEntity } from 'src/entities/post.entity';
import { CommentEntity } from './../../entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UserService } from './../user/user.service';
import { PostMetaEntity } from './../../entities/post_meta.entity';
import { TagService } from '../tags/tag.service';
import { appendUrlDomain, isNumberInput } from './../../helper/index';
import { UserFollowEntity } from 'src/entities/user_follow.entity';
import { CommonService } from './../common/common.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostMetaEntity)
    private readonly postMetaRepository: Repository<PostMetaEntity>,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    private readonly commonSevice: CommonService
  ) {}

  async getPostById(postId: number, userId?: number) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive AND post.id = :postId', { isActive: true, postId: postId })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', {
        metaPostKey: 'thumbnail_id',
      })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(pm.metaValue AS int)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'image.path as path',
      ])
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(*)').from(CommentEntity, 'cmt').where('cmt.postId = post.id');
      }, 'commentCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'vote')
          .where('vote.objectId = post.id')
          .andWhere('vote.type = :upvoteType', { upvoteType: 'UPVOTE_POST' });
      }, 'upvoteCount')
      .getRawOne();
    const authors = await this.commonSevice.getAuthorPost([postId]);
    if (!post) return null;
    const tags = await this.tagService.findTagsByPostId(post.id);
    let isUpvote = false;
    if (userId) isUpvote = await this.commonSevice.checkIsFollow(userId, post.id);
    const result = {
      id: post?.id,
      title: post?.title,
      content: post?.content,
      countLike: parseInt(post?.upvoteCount),
      countComment: parseInt(post?.commentCount),
      image: post?.path ? appendUrlDomain(post?.path) : null,
      release_date: post?.releasedate,
      author: authors ? authors[post.id] : null,
      tags: tags[0] ? tags.map((item) => ({ name: item.name, slug: item.slug })) : [],
      isUpvote: isUpvote,
    };
    return result;
  }

  async getlistPost(query: {
    page?: number;
    perPage?: number;
    order?: string;
    direction?: string;
    title?: string;
    userId?: number;
  }): Promise<IFPageRsq<any>> {
    const direction = query.direction === 'asc' ? 'DESC' : 'ASC';
    const order = query.order === 'popularity' ? 'post.score' : 'post.createdAt';
    // Cú pháp truy vấn vào cơ sở dữ liệu để lấy thông tin cần thiết
    const queryPost = this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive', { isActive: true })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', { metaPostKey: 'thumbnail_id' })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(pm.metaValue AS int)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'image.path as path',
      ]);
    if (query.userId) {
      queryPost.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'follow')
          .where('follow.userId = :userId', {
            userId: query.userId,
          })
          .andWhere('follow.objectId = post.id')
          .andWhere('follow.type = :type', { type: 'UPVOTE_POST' });
      }, 'isUpvote');
    }

    const dataPromis = queryPost
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(*)').from(CommentEntity, 'cmt').where('cmt.postId = post.id');
      }, 'commentCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'vote')
          .where('vote.objectId = post.id')
          .andWhere('vote.type = :upvoteType', { upvoteType: 'UPVOTE_POST' });
      }, 'upvoteCount')
      .limit(query.perPage)
      .orderBy(order, direction)
      .offset((query.page - 1) * query.perPage)
      .getRawMany();

    const countPromise = queryPost.getCount();
    // Chạy bất đồng bộ để lấy dữ liệu
    const [data, count] = await Promise.all([dataPromis, countPromise]);
    const authors = await this.commonSevice.getAuthorPost(data.map((v) => v.id));
    //Map dữ liệu về đúng chuẩn cần lấy
    const content = data.map((post: any) => ({
      id: post?.id,
      title: post?.title,
      countLike: parseInt(post?.upvoteCount),
      countComment: parseInt(post?.commentCount),
      image: post?.path ? appendUrlDomain(post?.path) : null,
      release_date: post?.releasedate,
      author: authors ? authors[post.id] : null,
      isUpvote: post?.isUpvote ? (Number(post.isUpvote) > 0 ? true : false) : false,
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
    userId: number | string;
    userLogin?: number;
  }): Promise<IFPageRsq<any>> {
    const direction = query.direction === 'asc' ? 'DESC' : 'ASC';
    const order = query.order === 'popularity' ? 'post.score' : 'post.createdAt';
    // Cú pháp truy vấn vào cơ sở dữ liệu để lấy thông tin cần thiết
    const isInput = isNumberInput(query.userId);
    const queryPost = this.postRepository
      .createQueryBuilder('post')
      .where('post.isActive = :isActive', { isActive: true });

    if (isInput) queryPost.andWhere('post.userId = :userId', { userId: query.userId });
    else queryPost.andWhere('post.userId = :userId', { userName: query.userId });

    queryPost
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', { metaPostKey: 'thumbnail_id' })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(pm.metaValue AS int)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'image.path as path',
      ]);
    // xây các hàm bất đồng bộ lấy dữ liệu
    if (query.userLogin) {
      queryPost.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'follow')
          .where('follow.userId = :userId', {
            userId: query.userId,
          })
          .andWhere('follow.objectId = post.id')
          .andWhere('follow.type = :type', { type: 'UPVOTE_POST' });
      }, 'isUpvote');
    }
    const dataPromis = queryPost
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(*)').from(CommentEntity, 'cmt').where('cmt.postId = post.id');
      }, 'commentCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'vote')
          .where('vote.objectId = post.id')
          .andWhere('vote.type = :upvoteType', { upvoteType: 'UPVOTE_POST' });
      }, 'upvoteCount')
      .limit(query.perPage)
      .orderBy(order, direction)
      .offset((query.page - 1) * query.perPage)
      .getRawMany();
    const countPromise = queryPost.getCount();
    // Chạy bất đồng bộ để lấy dữ liệu
    const [data, count] = await Promise.all([dataPromis, countPromise]);

    const authors = await this.commonSevice.getAuthorPost(data.map((v) => v.id));
    //Map dữ liệu về đúng chuẩn cần lấy
    const content = data.map((post: any) => ({
      id: post?.id,
      title: post?.title,
      countLike: parseInt(post?.upvoteCount),
      countComment: parseInt(post?.commentCount),
      image: post?.path ? appendUrlDomain(post?.path) : null,
      release_date: post?.releasedate,
      author: authors ? authors[post.id] : null,
      isUpvote: post?.isUpvote ? (Number(post.isUpvote) > 0 ? true : false) : false,
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
    post.tags = await this.tagService.setTagEntityByArrSlug(tags);
    const postNew = await this.postRepository.save(post);
    //Tạo meta cho post
    if (body.imageId) {
      const meta = new PostMetaEntity();
      meta.post = postNew;
      meta.metaKey = 'thumbnail_id';
      meta.metaValue = body.imageId.toString() || '';
      await this.postMetaRepository.save(meta);
    }
    //Gán tas cho user tạo
    await this.userService.setTagWithUser(user.id, tags);
    return await this.getPostById(postNew.id);
  }
}
