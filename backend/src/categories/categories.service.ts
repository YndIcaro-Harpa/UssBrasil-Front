import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  brandId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  brandId?: string;
  isActive?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);
    
    // Verificar se categoria já existe
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [
          { name: createCategoryDto.name },
          { slug: slug },
        ],
      },
    });

    if (existingCategory) {
      throw new ConflictException('Categoria já existe');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
      include: {
        brand: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        brand: true,
        products: {
          where: { status: 'ACTIVE' },
          take: 10,
          include: {
            brand: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        brand: true,
        products: {
          where: { status: 'ACTIVE' },
          include: {
            brand: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    
    const updateData: any = { ...updateCategoryDto };
    
    if (updateCategoryDto.name) {
      updateData.slug = this.generateSlug(updateCategoryDto.name);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        brand: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Verificar se há produtos associados
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      // Soft delete se há produtos associados
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Delete completo se não há produtos
      return this.prisma.category.delete({
        where: { id },
      });
    }
  }

  async uploadImage(categoryId: string, file: Express.Multer.File) {
    const category = await this.findOne(categoryId);
    
    const uploadedImage = await this.cloudinaryService.uploadImage(
      file,
      `uss-brasil/categories/${category.slug}`,
    );

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        image: uploadedImage.secure_url,
      },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async seedDefaultCategories() {
    // Buscar marcas para associar às categorias
    const brands = await this.prisma.brand.findMany();
    const brandMap = new Map(brands.map(b => [b.name, b.id]));

    const defaultCategories = [
      {
        name: 'Fones de Ouvido',
        slug: 'fones-de-ouvido',
        description: 'Fones de ouvido premium e acessórios de áudio',
        icon: 'Headphones',
        color: '#3B82F6',
        sortOrder: 1,
        brandId: brandMap.get('JBL') || null,
      },
      {
        name: 'Celulares',
        slug: 'celulares',
        description: 'Smartphones e dispositivos móveis',
        icon: 'Smartphone',
        color: '#10B981',
        sortOrder: 2,
        brandId: brandMap.get('Apple') || null,
      },
      {
        name: 'Acessórios',
        slug: 'acessorios',
        description: 'Capas, carregadores e acessórios móveis',
        icon: 'Cable',
        color: '#8B5CF6',
        sortOrder: 3,
        brandId: brandMap.get('Xiaomi') || null,
      },
      {
        name: 'Drones',
        slug: 'drones',
        description: 'Drones profissionais e recreativos',
        icon: 'Plane',
        color: '#F59E0B',
        sortOrder: 4,
        brandId: brandMap.get('DJI') || null,
      },
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: categoryData.slug },
      });

      if (!existingCategory) {
        await this.prisma.category.create({
          data: categoryData,
        });
      }
    }
  }
}