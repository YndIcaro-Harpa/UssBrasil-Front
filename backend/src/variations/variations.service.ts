import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariationDto, UpdateVariationDto, BulkCreateVariationsDto } from './dto/variation.dto';

@Injectable()
export class VariationsService {
  constructor(private prisma: PrismaService) {}

  // Criar uma variação
  async create(createVariationDto: CreateVariationDto) {
    // Verificar se SKU já existe
    const existingSku = await this.prisma.productVariation.findUnique({
      where: { sku: createVariationDto.sku },
    });

    if (existingSku) {
      throw new ConflictException(`SKU "${createVariationDto.sku}" já existe`);
    }

    // Verificar se produto pai existe
    const product = await this.prisma.product.findUnique({
      where: { id: createVariationDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto pai não encontrado');
    }

    return this.prisma.productVariation.create({
      data: {
        productId: createVariationDto.productId,
        name: createVariationDto.name,
        sku: createVariationDto.sku,
        ncm: createVariationDto.ncm,
        colorName: createVariationDto.colorName,
        colorCode: createVariationDto.colorCode,
        colorImage: createVariationDto.colorImage,
        storage: createVariationDto.storage,
        size: createVariationDto.size,
        costPrice: createVariationDto.costPrice,
        price: createVariationDto.price,
        discountPrice: createVariationDto.discountPrice,
        stock: createVariationDto.stock || 0,
        status: createVariationDto.status || 'ACTIVE',
        isActive: createVariationDto.isActive ?? true,
        image: createVariationDto.image,
        supplierId: createVariationDto.supplierId,
        supplierName: createVariationDto.supplierName,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
        supplier: true,
      },
    });
  }

  // Criar múltiplas variações de uma vez
  async bulkCreate(bulkDto: BulkCreateVariationsDto) {
    const { productId, variations } = bulkDto;

    // Verificar se produto pai existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto pai não encontrado');
    }

    // Verificar SKUs duplicados
    const skus = variations.map(v => v.sku);
    const existingSkus = await this.prisma.productVariation.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });

    if (existingSkus.length > 0) {
      const duplicates = existingSkus.map(s => s.sku).join(', ');
      throw new ConflictException(`SKUs já existem: ${duplicates}`);
    }

    // Criar todas as variações
    const created = await this.prisma.$transaction(
      variations.map(variation =>
        this.prisma.productVariation.create({
          data: {
            productId,
            name: variation.name,
            sku: variation.sku,
            ncm: variation.ncm,
            colorName: variation.colorName,
            colorCode: variation.colorCode,
            colorImage: variation.colorImage,
            storage: variation.storage,
            size: variation.size,
            costPrice: variation.costPrice,
            price: variation.price,
            discountPrice: variation.discountPrice,
            stock: variation.stock || 0,
            status: variation.status || 'ACTIVE',
            isActive: variation.isActive ?? true,
            image: variation.image,
            supplierId: variation.supplierId,
            supplierName: variation.supplierName,
          },
        })
      )
    );

    return {
      count: created.length,
      variations: created,
    };
  }

  // Buscar todas as variações
  async findAll(productId?: string) {
    const where = productId ? { productId } : {};

    return this.prisma.productVariation.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Buscar variações por produto
  async findByProduct(productId: string) {
    return this.prisma.productVariation.findMany({
      where: { productId },
      include: {
        supplier: true,
      },
      orderBy: [
        { colorName: 'asc' },
        { storage: 'asc' },
      ],
    });
  }

  // Buscar uma variação por ID
  async findOne(id: string) {
    const variation = await this.prisma.productVariation.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, categoryId: true },
        },
        supplier: true,
      },
    });

    if (!variation) {
      throw new NotFoundException('Variação não encontrada');
    }

    return variation;
  }

  // Buscar variação por SKU
  async findBySku(sku: string) {
    const variation = await this.prisma.productVariation.findUnique({
      where: { sku },
      include: {
        product: true,
        supplier: true,
      },
    });

    if (!variation) {
      throw new NotFoundException('Variação não encontrada');
    }

    return variation;
  }

  // Atualizar uma variação
  async update(id: string, updateVariationDto: UpdateVariationDto) {
    const variation = await this.prisma.productVariation.findUnique({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException('Variação não encontrada');
    }

    // Se estiver atualizando SKU, verificar se já existe
    if (updateVariationDto.sku && updateVariationDto.sku !== variation.sku) {
      const existingSku = await this.prisma.productVariation.findUnique({
        where: { sku: updateVariationDto.sku },
      });

      if (existingSku) {
        throw new ConflictException(`SKU "${updateVariationDto.sku}" já existe`);
      }
    }

    return this.prisma.productVariation.update({
      where: { id },
      data: updateVariationDto,
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
        supplier: true,
      },
    });
  }

  // Atualizar estoque
  async updateStock(id: string, quantity: number) {
    const variation = await this.prisma.productVariation.findUnique({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException('Variação não encontrada');
    }

    const newStock = variation.stock + quantity;
    const status = newStock <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE';

    return this.prisma.productVariation.update({
      where: { id },
      data: {
        stock: Math.max(0, newStock),
        status,
      },
    });
  }

  // Remover uma variação
  async remove(id: string) {
    const variation = await this.prisma.productVariation.findUnique({
      where: { id },
    });

    if (!variation) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.prisma.productVariation.delete({
      where: { id },
    });
  }

  // Remover todas as variações de um produto
  async removeByProduct(productId: string) {
    return this.prisma.productVariation.deleteMany({
      where: { productId },
    });
  }

  // Estatísticas de variações
  async getStats(productId?: string) {
    const where = productId ? { productId } : {};

    const [total, active, outOfStock, totalStock] = await Promise.all([
      this.prisma.productVariation.count({ where }),
      this.prisma.productVariation.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.productVariation.count({ where: { ...where, status: 'OUT_OF_STOCK' } }),
      this.prisma.productVariation.aggregate({
        where,
        _sum: { stock: true },
      }),
    ]);

    return {
      total,
      active,
      outOfStock,
      inactive: total - active - outOfStock,
      totalStock: totalStock._sum.stock || 0,
    };
  }
}
