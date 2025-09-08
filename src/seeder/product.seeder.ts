import { DataSource } from 'typeorm';
import { Product } from '../product/entities/product.entity';

export class ProductSeeder {
  static async run(dataSource: DataSource) {
    const productRepo = dataSource.getRepository(Product);

    const sampleProduct = productRepo.create({
      name: 'Sample Product',
      price: 199.99,
      stock: 50,
      image: undefined,
      images: [],
    });

    await productRepo.save(sampleProduct);
    console.log('Sample product created successfully.');
  }
}
