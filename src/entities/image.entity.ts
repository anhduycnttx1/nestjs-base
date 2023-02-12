import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { PostEntity } from './post.entity';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taxonomy: string;

  @Column()
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => UserEntity, (user) => user.image)
  @JoinTable()
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => CommentEntity, (comment) => comment.image)
  @JoinTable()
  comment: CommentEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => PostEntity, (post) => post.images)
  @JoinTable()
  post: PostEntity;
}
