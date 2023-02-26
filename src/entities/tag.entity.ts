import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { PostEntity } from './post.entity';

import { UserEntity } from './user.entity';

@Entity()
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  posts: PostEntity[];

  @ManyToMany(() => UserEntity, (user) => user.tags)
  users: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
