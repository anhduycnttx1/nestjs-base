import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { TagEntity } from 'src/entities/tag.entity';

@Entity()
export class UserTagRelationshipsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  score: number;

  @ManyToOne(() => UserEntity, (user) => user.tags)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => TagEntity, (tag) => tag.userFollow)
  @JoinColumn({ name: 'tagId' })
  tag: TagEntity;
}
