import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'image' })
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taxonomy: string;

  @Column()
  authorId: number;

  @Column()
  path: string;

  @Column()
  imgName: string;
}
