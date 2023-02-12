import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ImageEntity } from './image.entity';
import { PostEntity } from './post.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  hashRefresh: string;

  @Column()
  status: string;

  @Column()
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => ImageEntity, (image) => image.user, { cascade: true })
  image: ImageEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => PostEntity, (post) => post.user)
  posts: PostEntity[];
}
