import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { CommentMetaEntity } from './comment_meta.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  userId: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  post: PostEntity;

  @OneToMany(() => CommentMetaEntity, (meta) => meta.comment)
  metas: CommentMetaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
