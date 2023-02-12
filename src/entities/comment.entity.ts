import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ImageEntity } from './image.entity';
import { PostEntity } from './post.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => ImageEntity, (image) => image.comment, { cascade: true })
  image: ImageEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => PostEntity, (post) => post.comments)
  post: PostEntity;
}
