import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('decimal')
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  image: string; // single image

  @Column('text', { array: true, nullable: true })
  images: string[]; // multiple images

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
