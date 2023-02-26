import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_tags_relationships' })
export class UserTagRelationshipsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  tagId: number;

  @Column({ default: 1 })
  score: number;
}
