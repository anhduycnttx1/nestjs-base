import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { CommentEntity } from './comment.entity';

@Entity()
export class CommentMetaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.metas)
  @JoinColumn()
  comment: CommentEntity;

  @Column()
  metaKey: string;

  @Column()
  metaValue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
