import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum TaxonomyEnum {
  POST_IMAGE,
  COMMENT_IMAGE,
  USER_IMAGE,
}

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TaxonomyEnum })
  taxonomy: TaxonomyEnum;

  @Column()
  path: string;

  @Column()
  imgName: string;
}
