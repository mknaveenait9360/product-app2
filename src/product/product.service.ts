import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectQueue('productQueue') private readonly productQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateProductDto, image?: string, images?: string[]) {
    const product = this.productRepo.create({
      ...dto,
      image: image ?? undefined,
      images: images ?? [],
    });
    return this.productRepo.save(product);
  }

  async findAll(filters?: { name?: string; price?: number; stock?: number }) {
    const query = this.productRepo.createQueryBuilder('product');

    if (filters?.name)
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
    if (filters?.price)
      query.andWhere('product.price = :price', { price: filters.price });
    if (filters?.stock)
      query.andWhere('product.stock = :stock', { stock: filters.stock });

    return query.getMany();
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.productRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Product with id ${id} not found`);
    return { message: 'Product deleted successfully' };
  }

  async addProductJob(productId: number) {
    await this.productQueue.add('add-product-job', { productId });
    return { message: `Job added for product ${productId}` };
  }

  getRedisInfo() {
    return {
      host: this.configService.get<string>('REDIS_HOST'),
      port: Number(this.configService.get<number>('REDIS_PORT')),
    };
  }

  // ==========================
  // New method to update images
  // ==========================
  async updateImages(
    productId: number,
    updatedImages: string[],
    imagesToDelete: string[] = [],
    newImages: Express.Multer.File[] = [],
  ) {
    const product = await this.findOne(productId);

    // Delete selected images from filesystem
    for (const img of imagesToDelete) {
      const filePath = join(__dirname, '..', '..', 'uploads', 'products', img);
      try {
        unlinkSync(filePath);
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Failed to delete image ${img}:`, err.message);
        }
        console.warn('An unkown error occured');
      }
    }

    // Add new uploaded images
    const newImageFilenames = newImages.map((file) => file.filename);

    // Update the product images array
    product.images = [...updatedImages, ...newImageFilenames];

    return this.productRepo.save(product);
  }
}
