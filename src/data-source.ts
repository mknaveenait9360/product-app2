import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './auth/entities/user.entity';
import { Product } from './product/entities/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'naveen357',
  database: process.env.DB_DATABASE || 'productDb',
  entities: [User, Product],
  synchronize: true,
});
