import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const slug = this.generateSlug(createBrandDto.name);
    
    // Verificar se marca já existe
    const existingBrand = await this.prisma.brand.findFirst({
      where: {
        OR: [
          { name: createBrandDto.name },
          { slug: slug },
        ],
      },
    });

    if (existingBrand) {
      throw new ConflictException('Marca já existe');
    }

    return this.prisma.brand.create({
      data: {
        ...createBrandDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          take: 10,
          include: {
            category: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            category: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);
    
    const updateData: any = { ...updateBrandDto };
    
    if (updateBrandDto.name) {
      updateData.slug = this.generateSlug(updateBrandDto.name);
    }

    return this.prisma.brand.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Verificar se há produtos associados
    const productsCount = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      // Soft delete se há produtos associados
      return this.prisma.brand.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Delete completo se não há produtos
      return this.prisma.brand.delete({
        where: { id },
      });
    }
  }

  async uploadLogo(brandId: string, file: Express.Multer.File) {
    const brand = await this.findOne(brandId);
    
    const uploadedImage = await this.cloudinaryService.uploadImage(
      file,
      `uss-brasil/brands/${brand.slug}`,
    );

    return this.prisma.brand.update({
      where: { id: brandId },
      data: {
        logo: uploadedImage.secure_url,
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

  async seedDefaultBrands() {
    const defaultBrands = [
      {
        name: 'Apple',
        slug: 'apple',
        description: 'Inovação e tecnologia premium',
        color: '#000000',
      },
      {
        name: 'JBL',
        slug: 'jbl',
        description: 'Audio de qualidade profissional',
        color: '#FF6900',
      },
      {
        name: 'Xiaomi',
        slug: 'xiaomi',
        description: 'Tecnologia acessível e inovadora',
        color: '#FF6900',
      },
      {
        name: 'DJI',
        slug: 'dji',
        description: 'Líderes em tecnologia de drones',
        color: '#131313',
      },
      {
        name: 'Geonav',
        slug: 'geonav',
        description: 'Eletrônicos automotivos',
        color: '#1976d2',
      },
    ];

    for (const brandData of defaultBrands) {
      const existingBrand = await this.prisma.brand.findUnique({
        where: { slug: brandData.slug },
      });

      if (!existingBrand) {
        await this.prisma.brand.create({
          data: brandData,
        });
      }
    }
  }
}