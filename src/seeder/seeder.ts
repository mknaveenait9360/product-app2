import { AppDataSource } from '../data-source';
import { User } from '../auth/entities/user.entity';
import { Product } from "../product/entities/product.entity";
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    await AppDataSource.initialize();

 
    const hashed = await bcrypt.hash('admin123', 10);
    const admin = AppDataSource.manager.create(User, {
      username: 'admin',
      email: 'admin@example.com',
      password: hashed,
      role: 'admin', 
    });
    await AppDataSource.manager.save(admin);

    const product = AppDataSource.manager.create(Product, {
  name: 'Sample Product',
  price: 100,
  stock: 10,
  image: undefined, 
  images: [],
});
    await AppDataSource.manager.save(product);

    console.log('Seeding finished!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Seeding failed!', err);
  }
}

seed();
