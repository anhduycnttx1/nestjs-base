import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taxonomy: string;

  @Column()
  authorId: string;

  @Column()
  path: string;

  @Column()
  imgName: string;
}
