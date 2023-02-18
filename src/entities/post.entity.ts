import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from './user.entity';
import { PostMetaEntity } from './post_meta.entity';
import { TagEntity } from './tag.entity';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  countLike: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => PostMetaEntity, (meta) => meta.post)
  metas: PostMetaEntity[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => TagEntity, (meta) => meta.post)
  tags: TagEntity[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => UserEntity, (user) => user.posts)
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
