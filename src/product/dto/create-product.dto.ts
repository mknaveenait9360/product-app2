// create-product.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  stock?: number;

  @IsOptional()
  @IsString()
  userId?: number;
}
