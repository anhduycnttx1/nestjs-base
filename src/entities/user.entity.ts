import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
  JoinColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserMetaEntity } from './user_meta.entity';
import { TagEntity } from './tag.entity';
import { UserFollowEntity } from './user_follow.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userName: string;

  @Column()
  userPass: string;

  @Column({ unique: true })
  userEmail: string;

  @Column({ nullable: true })
  hashRefresh: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => TagEntity, (tag) => tag.users)
  @JoinTable({
    name: 'user_tags_relationships',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  @JoinColumn({ name: 'score', referencedColumnName: 'score' })
  score: number;
  tags: TagEntity[];

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => UserMetaEntity, (meta) => meta.user)
  metas: UserMetaEntity[];

  @OneToMany(() => UserFollowEntity, (follow) => follow.user)
  follows: UserFollowEntity[];
}
