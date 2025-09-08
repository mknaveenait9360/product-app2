import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Protect all routes
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Single image upload
  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req,
  ) {
    try {
      dto.userId = req.user.id; // assign userId inside DTO
      const imagePath = image ? image.filename : undefined;
      return await this.productService.create(dto, imagePath, []);
    } catch (error) {
      return { message: 'Error creating product', error: error.message };
    }
  }

  // Multiple image upload
  @Post('create-multi')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createMulti(
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req,
  ) {
    try {
      dto.userId = req.user.id; // assign userId inside DTO
      const imagePaths = images?.map((file) => file.filename) || [];
      return await this.productService.create(dto, undefined, imagePaths);
    } catch (error) {
      return {
        message: 'Error creating product with multiple images',
        error: error.message,
      };
    }
  }

  // Get all products with optional filters
  @Get()
  async findAll(
    @Query() filters: { name?: string; price?: number; stock?: number },
    @Req() req,
  ) {
    try {
      return await this.productService.findAll(filters);
    } catch (error) {
      return { message: 'Error fetching products', error: error.message };
    }
  }

  // Get one product by ID
  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req) {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      return { message: `Error fetching product with id ${id}`, error: error.message };
    }
  }

  // Update product
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateProductDto, @Req() req) {
    try {
      return await this.productService.update(id, dto);
    } catch (error) {
      return { message: `Error updating product with id ${id}`, error: error.message };
    }
  }

  // Delete product
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    try {
      return await this.productService.remove(id);
    } catch (error) {
      return { message: `Error deleting product with id ${id}`, error: error.message };
    }
  }

  // Add job to queue
  @Post(':id/add-job')
  async addJob(@Param('id') id: number, @Req() req) {
    await this.productService.addProductJob(+id);
    return { message: `Job added for product ${id}` };
  }
}
