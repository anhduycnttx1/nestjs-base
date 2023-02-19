import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { PostEntity } from './post.entity';
import { UserMetaEntity } from './user_meta.entity';

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

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => UserMetaEntity, (meta) => meta.user)
  metas: UserMetaEntity[];
}
