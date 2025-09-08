import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductProcessor } from './product.processor';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User]),
    AuthModule,
    BullModule.registerQueue({ name: 'productQueue' }),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductProcessor],
  exports: [ProductService],
})
export class ProductModule {}
