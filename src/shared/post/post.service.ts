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
import { appendUrlDomain, generateKeyCache, validatedKeyCache } from './../../helper/index';
import { UserFollowEntity } from 'src/entities/user_follow.entity';
import { CommonService } from './../common/common.service';
import { UserTagRelationshipsEntity } from 'src/entities/user_tags_relationships';
import { UserEntity } from './../../entities/user.entity';

type QueryPosts = {
  page?: number;
  perPage?: number;
  order?: string;
  direction?: string;
  title?: string;
  memberId?: number;
  userLoginId?: number;
};

@Injectable()
export class PostService {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map<string, { data: any; expiresAt: number }>();
  private orderKey = {
    popularity: 'post.score',
    upvote: 'upvotecount',
    comment: 'commentcount',
  };
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostMetaEntity)
    private readonly postMetaRepository: Repository<PostMetaEntity>,
    @InjectRepository(UserTagRelationshipsEntity)
    private readonly userTagRelationRepository: Repository<UserTagRelationshipsEntity>,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    private readonly commonSevice: CommonService
  ) {}

  async getPostById(postId: number, memberId?: number) {
    const keyCache = generateKeyCache('post_details', { postId, memberId });
    const cachedPosts = this.cache.get(keyCache);
    if (cachedPosts && cachedPosts.expiresAt > Date.now() && validatedKeyCache(keyCache, { postId, memberId })) {
      return cachedPosts.data.result;
    }
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
    if (memberId) isUpvote = await this.commonSevice.checkIsFollow(memberId, post.id);
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
    this.cache.set(keyCache, { data: { result }, expiresAt: Date.now() + 3000 });
    return result;
  }

  async getPosts(query: QueryPosts): Promise<IFPageRsq<any>> {
    const direction = query.direction === 'asc' ? 'ASC' : 'DESC';
    const order = this.orderKey[query.order] ? this.orderKey[query.order] : 'post.createdAt';
    // Cú pháp truy vấn vào cơ sở dữ liệu để lấy thông tin cần thiết
    const keyCache = generateKeyCache('posts_data', query);
    const cachedPosts = this.cache.get(keyCache);
    if (cachedPosts && cachedPosts.expiresAt > Date.now() && validatedKeyCache(keyCache, query)) {
      return {
        page_index: query.page,
        item_count: query.perPage,
        page_total: Math.ceil(cachedPosts.data.count / query.perPage),
        item_total: cachedPosts.data.count,
        content: cachedPosts.data.content,
      };
    }
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
    if (query.title) {
      queryPost.andWhere('post.title ILIKE :title', { title: `%${query.title}%` });
    }
    if (query.memberId) {
      queryPost.andWhere('post.userId = :memberId', { memberId: query.memberId });
    }
    if (query.userLoginId) {
      queryPost.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'follow')
          .where('follow.userId = :userLoginId', {
            userLoginId: query.userLoginId,
          })
          .andWhere('follow.objectId = post.id')
          .andWhere('follow.type = :type', { type: 'UPVOTE_POST' });
      }, 'isUpvote');
    }
    const dataPromis = queryPost
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(*)').from(CommentEntity, 'cmt').where('cmt.postId = post.id');
      }, 'commentcount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'vote')
          .where('vote.objectId = post.id')
          .andWhere('vote.type = :upvoteType', { upvoteType: 'UPVOTE_POST' });
      }, 'upvotecount')
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
      countLike: parseInt(post?.upvotecount),
      countComment: parseInt(post?.commentcount),
      image: post?.path ? appendUrlDomain(post?.path) : null,
      release_date: post?.releasedate,
      author: authors ? authors[post.id] : null,
      isUpvote: post?.isUpvote ? (Number(post.isUpvote) > 0 ? true : false) : false,
    }));
    this.cache.set(keyCache, { data: { content, count }, expiresAt: Date.now() + 3000 });
    return {
      page_index: query.page,
      item_count: query.perPage,
      page_total: Math.ceil(count / query.perPage),
      item_total: count,
      content: content,
    };
  }

  async getFeedsPosts(query: { page?: number; perPage?: number; userLoginId: number }): Promise<IFPageRsq<any>> {
    const keyCache = generateKeyCache('feed_posts_data', query);
    const cachedPosts = this.cache.get(keyCache);
    if (cachedPosts && cachedPosts.expiresAt > Date.now() && validatedKeyCache(keyCache, query)) {
      return {
        page_index: query.page,
        item_count: query.perPage,
        page_total: Math.ceil(cachedPosts.data.count / query.perPage),
        item_total: cachedPosts.data.count,
        content: cachedPosts.data.content,
      };
    }
    const userTags = await this.userTagRelationRepository.find({
      where: { userId: query.userLoginId },
      take: 10,
      skip: 0,
    });
    const tagIds = userTags.map((v) => v.tagId);
    const queryPost = this.postRepository
      .createQueryBuilder('post')
      .distinct()
      .where('post.isActive = :isActive', { isActive: true })
      .leftJoin('post.metas', 'pm', 'pm.metaKey = :metaPostKey', { metaPostKey: 'thumbnail_id' })
      .leftJoin(ImageEntity, 'image', 'image.id = CAST(pm.metaValue AS int)')
      .innerJoin('post_tags_relationships', 'ptsr', 'ptsr.postEntityId = post.id')
      .andWhere('ptsr.tagEntityId IN (:...tagIds)', { tagIds: tagIds })
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.createdAt as releasedate',
        'image.path as path',
      ])
      //.leftJoin('post_tags_relationships', 'ptrSelect', 'ptrSelect.tagEntityId = utrSelect.tagId')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(utrSelect.score)')
          .from(UserTagRelationshipsEntity, 'utrSelect')
          .innerJoin(UserEntity, 'uSelect', 'uSelect.id = utrSelect.userId')
          .where('uSelect.id = :uSelectId', { uSelectId: query.userLoginId })
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .from('post_tags_relationships', 'ptrSelect')
              .where('ptrSelect.postEntityId = post.id')
              .select('ptrSelect.tagEntityId')
              .getQuery();
            return `utrSelect.tagId IN (${subQuery})`;
          });
      }, 'scorefollow')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'follow')
          .where('follow.userId = :userLoginId', {
            userLoginId: query.userLoginId,
          })
          .andWhere('follow.objectId = post.id')
          .andWhere('follow.type = :type', { type: 'UPVOTE_POST' });
      }, 'isUpvote');

    //query tag

    const dataPromis = queryPost
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(*)').from(CommentEntity, 'cmt').where('cmt.postId = post.id');
      }, 'commentcount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserFollowEntity, 'vote')
          .where('vote.objectId = post.id')
          .andWhere('vote.type = :upvoteType', { upvoteType: 'UPVOTE_POST' });
      }, 'upvotecount')
      .limit(query.perPage)
      .orderBy('scorefollow', 'DESC')
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
      countLike: parseInt(post?.upvotecount),
      countComment: parseInt(post?.commentcount),
      image: post?.path ? appendUrlDomain(post?.path) : null,
      release_date: post?.releasedate,
      author: authors ? authors[post.id] : null,
      isUpvote: post?.isUpvote ? (Number(post.isUpvote) > 0 ? true : false) : false,
    }));
    this.cache.set(keyCache, { data: { content, count }, expiresAt: Date.now() + 3000 });
    return {
      page_index: query.page,
      item_count: query.perPage,
      page_total: Math.ceil(count / query.perPage),
      item_total: count,
      content: content,
    };
  }
  async deletePost(postId: number, userId: number) {
    // const post = this.postRepository.
    // if ()
    return 'okey';
  }

  async createNewPost(userId: number, body: CreatePostDto) {
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
