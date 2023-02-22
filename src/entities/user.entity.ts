import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserMetaEntity } from './user_meta.entity';

import { UserTagRelationshipsEntity } from './user_tags_relationships';
import { TagEntity } from './tag.entity';
// import { UserTagRelationshipsEntity } from './user_tags_relationships';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  tags: TagEntity[];
  // @OneToMany(() => UserTagRelationshipsEntity, (relation) => relation.user)
  // userTags: UserTagRelationshipsEntity[];

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => UserMetaEntity, (meta) => meta.user)
  metas: UserMetaEntity[];
}
