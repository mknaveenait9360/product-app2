import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectQueue('productQueue') private readonly productQueue: Queue, // Queue injection
    private readonly configService: ConfigService, 

  ) {}


  async create(
  dto: CreateProductDto,
  image?: string,
  images?: string[],
  userId?: number, // ✅ new optional parameter
) {
  const product = this.productRepo.create({
    ...dto,
    image: image ?? undefined,
    images: images ?? [],
    
  });
  return this.productRepo.save(product);
}


  async findAll(filters?: { name?: string; price?: number; stock?: number }) {
    try {
      const query = this.productRepo.createQueryBuilder('product');

      if (filters?.name)
        query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
      if (filters?.price) query.andWhere('product.price = :price', { price: filters.price });
      if (filters?.stock) query.andWhere('product.stock = :stock', { stock: filters.stock });

      return await query.getMany();
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }


  async findOne(id: number) {
    try {
      const product = await this.productRepo.findOne({ where: { id } });
      if (!product) throw new NotFoundException(`Product with id ${id} not found`);
      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    try {
      await this.productRepo.update(id, dto);
      return this.findOne(id);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.productRepo.delete(id);
      if (result.affected === 0) throw new NotFoundException(`Product with id ${id} not found`);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }


  async addProductJob(productId: number) {
    try {
      await this.productQueue.add('add-product-job', { productId });
      return { message: `Job added for product ${productId}` };
    } catch (error) {
      throw new Error(`Failed to add job for product ${productId}: ${error.message}`);
    }
  }


  getRedisInfo() {
    return {
      host: this.configService.get<string>('REDIS_HOST'),
      port: Number(this.configService.get<number>('REDIS_PORT')),
      
      
    };
    

  }
  
}
