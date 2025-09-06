import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

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

  // NEW METHOD: Update product images
  async updateImages(id: number, imageList: string[]): Promise<any> {
    try {
      // First, get the current product to check existing images
      const currentProduct = await this.findOne(id);
      const oldImages = currentProduct.images || [];

      // Update the product with new image list
      const result = await this.productRepo.update(id, { 
        images: imageList 
      });

      // Clean up old image files that are no longer used
      const imagesToDelete = oldImages.filter(img => !imageList.includes(img));
      await this.cleanupUnusedImages(imagesToDelete);

      // Return updated product
      const updatedProduct = await this.findOne(id);
      return {
        success: true,
        product: updatedProduct,
        deletedImages: imagesToDelete,
        message: `Updated images for product ${id}`,
      };
    } catch (error) {
      throw new Error(`Failed to update images: ${error.message}`);
    }
  }

  // Helper method to clean up unused image files
  private async cleanupUnusedImages(imagesToDelete: string[]): Promise<void> {
    const uploadDir = './uploads/products';
    
    for (const imageName of imagesToDelete) {
      try {
        const filePath = path.join(uploadDir, imageName);
        
        // Check if file exists before trying to delete
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted unused image: ${imageName}`);
        }
      } catch (error) {
        console.error(`Failed to delete image ${imageName}:`, error.message);
        // Don't throw error here to avoid breaking the main operation
      }
    }
  }

  async remove(id: number) {
    try {
      // Get product first to clean up its images
      const product = await this.findOne(id);
      const imagesToDelete = product.images || [];

      // Delete the product from database
      const result = await this.productRepo.delete(id);
      if (result.affected === 0) throw new NotFoundException(`Product with id ${id} not found`);

      // Clean up associated image files
      await this.cleanupUnusedImages(imagesToDelete);
      
      // Also clean up single image if it exists
      if (product.image) {
        await this.cleanupUnusedImages([product.image]);
      }

      return { message: 'Product and associated images deleted successfully' };
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