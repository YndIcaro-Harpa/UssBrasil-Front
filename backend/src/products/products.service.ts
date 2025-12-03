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
      // SQLite doesn't support mode: 'insensitive', so we use contains only
      // The search will be case-sensitive in SQLite
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: searchLower } },
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
          brand: true,
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

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: 'INACTIVE' },
    });

    return {
      success: true,
      deletedCount: result.count,
      ids,
    };
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    const result = await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return {
      success: true,
      updatedCount: result.count,
      ids,
      status,
    };
  }

  async bulkUpdateStock(updates: { id: string; stock: number }[]) {
    const results = await Promise.all(
      updates.map(({ id, stock }) =>
        this.prisma.product.update({
          where: { id },
          data: { stock },
          select: { id: true, name: true, stock: true },
        })
      )
    );

    return {
      success: true,
      updatedCount: results.length,
      products: results,
    };
  }

  async duplicate(id: string) {
    const product = await this.findOne(id);
    
    const newSlug = this.generateSlug(`${product.name} Copy`);

    return this.prisma.product.create({
      data: {
        name: `${product.name} (Cópia)`,
        slug: newSlug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPrice: product.discountPrice,
        stock: product.stock,
        images: product.images,
        tags: product.tags,
        specifications: product.specifications,
        dimensions: product.dimensions,
        weight: product.weight,
        featured: false,
        isFeatured: false,
        isActive: false, // Novo produto inativo por padrão
        status: 'DRAFT',
        sku: product.sku ? `${product.sku}-COPY` : null,
        categoryId: product.categoryId,
        brandId: product.brandId,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        warranty: product.warranty,
        colors: product.colors,
        sizes: product.sizes,
        storage: product.storage,
        rating: 0,
        totalReviews: 0,
      },
      include: {
        category: true,
      },
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

  async getProductStats() {
    const [
      totalProducts,
      activeProducts,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      featuredCount,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.aggregate({
        _sum: {
          stock: true,
        },
        where: { isActive: true },
      }),
      this.prisma.product.count({
        where: {
          stock: { gt: 0, lte: 5 },
          isActive: true,
        },
      }),
      this.prisma.product.count({
        where: {
          stock: 0,
          isActive: true,
        },
      }),
      this.prisma.product.count({ where: { featured: true } }),
    ]);

    // Calcular valor total do estoque
    const productsWithValue = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { price: true, stock: true },
    });
    
    const totalValue = productsWithValue.reduce(
      (sum, p) => sum + (p.price * p.stock),
      0
    );

    return {
      totalProducts,
      activeProducts,
      totalStockUnits: totalStockValue._sum.stock || 0,
      totalStockValue: totalValue,
      lowStockCount,
      outOfStockCount,
      featuredCount,
    };
  }

  async getLowStockProducts(threshold: number = 5, limit: number = 10) {
    return this.prisma.product.findMany({
      where: {
        stock: { lte: threshold },
        isActive: true,
      },
      take: limit,
      orderBy: { stock: 'asc' },
      include: {
        category: true,
        brand: true,
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