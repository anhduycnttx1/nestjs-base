import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ImageEntity } from './image.entity';
import { CommentEntity } from './comment.entity';
import { UserEntity } from './user.entity';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => UserEntity, (user) => user.posts)
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => ImageEntity, (image) => image.post)
  images: ImageEntity[];
}
