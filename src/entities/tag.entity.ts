import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { PostEntity } from './post.entity';

@Entity()
export class TagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tag_name: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => PostEntity, (post) => post.tags)
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
