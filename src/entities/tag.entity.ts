import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserTagRelationshipsEntity } from './user_tags_relationships';
import { UserEntity } from './user.entity';

@Entity({ name: 'tags' })
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

  @OneToMany(() => UserTagRelationshipsEntity, (relation) => relation.tag)
  userFollow: UserTagRelationshipsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
