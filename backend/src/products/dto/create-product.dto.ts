import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'iphone-15-pro-max', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'IPHONE15-256-BLK', required: false, description: 'Stock Keeping Unit - código único do produto' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 'Smartphone Apple com tecnologia A17 Pro' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 7999.99 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 8999.99, required: false, description: 'Preço original antes do desconto' })
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ example: 6999.99, required: false })
  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  stock!: number;

  @ApiProperty({ example: 'cluid-category-id' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: 'cluid-brand-id' })
  @IsString()
  brandId!: string;

  @ApiProperty({ example: 'url1.jpg,url2.jpg' })
  @IsString()
  @IsOptional()
  images?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiProperty({ example: true, required: false, description: 'Destaque especial - produto em destaque principal' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '{"processor": "A17 Pro", "storage": "512GB"}', required: false })
  @IsString()
  @IsOptional()
  specifications?: string;

  @ApiProperty({ example: 0.2, required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: '{"width": 15, "height": 7, "depth": 0.8}', required: false })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({ example: 12, required: false })
  @IsNumber()
  @IsOptional()
  warranty?: number;

  @ApiProperty({ example: 'smartphone,apple,premium', required: false })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ example: '["Preto", "Branco", "Azul"]', required: false })
  @IsString()
  @IsOptional()
  colors?: string;

  @ApiProperty({ example: '["P", "M", "G", "GG"]', required: false })
  @IsString()
  @IsOptional()
  sizes?: string;

  @ApiProperty({ example: '["128GB", "256GB", "512GB", "1TB"]', required: false })
  @IsString()
  @IsOptional()
  storage?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  images?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsNumber()
  @IsOptional()
  warranty?: number;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  colors?: string;

  @IsString()
  @IsOptional()
  sizes?: string;

  @IsString()
  @IsOptional()
  storage?: string;
}