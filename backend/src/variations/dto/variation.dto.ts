import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateVariationDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  colorName?: string;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsString()
  colorImage?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;
}

export class UpdateVariationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  colorName?: string;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsString()
  colorImage?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;
}

export class BulkCreateVariationsDto {
  @IsString()
  productId: string;

  variations: CreateVariationDto[];
}
