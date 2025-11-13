import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = this.generateSlug(createProductDto.name);
    
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        slug,
        images: createProductDto.images || '',
        tags: createProductDto.tags || '',
        specifications: createProductDto.specifications || '',
        dimensions: createProductDto.dimensions || '',
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    brandId?: string,
    featured?: boolean,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (featured !== undefined) where.featured = featured;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { featured: true },
      take: limit,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRelatedProducts(id: string, limit: number = 4) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
      },
      take: limit,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Check if exists

    const data: any = { ...updateProductDto };
    
    if (updateProductDto.name) {
      data.slug = this.generateSlug(updateProductDto.name);
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async uploadImages(id: string, files: Express.Multer.File[]) {
    const product = await this.findOne(id);
    
    const imageUrls: string[] = [];
    for (const file of files) {
      try {
        const result = await this.cloudinaryService.uploadImage(file, 'products');
        imageUrls.push(result.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    const existingImages = product.images ? product.images.split(',').filter(img => img) : [];
    const allImages = [...existingImages, ...imageUrls];

    return this.prisma.product.update({
      where: { id },
      data: {
        images: allImages.join(','),
      },
      include: {
        category: true,
      },
    });
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}