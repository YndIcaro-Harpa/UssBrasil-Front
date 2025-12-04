import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // Verificar se CNPJ já existe (se fornecido)
    if (createSupplierDto.cnpj) {
      const existing = await this.prisma.supplier.findUnique({
        where: { cnpj: createSupplierDto.cnpj },
      });

      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    return this.prisma.supplier.create({
      data: {
        name: createSupplierDto.name,
        cnpj: createSupplierDto.cnpj,
        email: createSupplierDto.email,
        phone: createSupplierDto.phone,
        address: createSupplierDto.address,
        city: createSupplierDto.city,
        state: createSupplierDto.state,
        zipCode: createSupplierDto.zipCode,
        isActive: createSupplierDto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
            variations: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          take: 10,
          select: { id: true, name: true, sku: true },
        },
        variations: {
          take: 10,
          select: { id: true, name: true, sku: true },
        },
        _count: {
          select: {
            products: true,
            variations: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return supplier;
  }

  async findByCnpj(cnpj: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { cnpj },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    // Verificar CNPJ duplicado
    if (updateSupplierDto.cnpj && updateSupplierDto.cnpj !== supplier.cnpj) {
      const existing = await this.prisma.supplier.findUnique({
        where: { cnpj: updateSupplierDto.cnpj },
      });

      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            variations: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    // Verificar se tem produtos/variações vinculados
    if (supplier._count.products > 0 || supplier._count.variations > 0) {
      throw new ConflictException(
        'Não é possível excluir fornecedor com produtos ou variações vinculados. Desative-o ao invés disso.'
      );
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });
  }

  async getStats() {
    const [total, active, inactive, withProducts] = await Promise.all([
      this.prisma.supplier.count(),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.supplier.count({ where: { isActive: false } }),
      this.prisma.supplier.count({
        where: {
          OR: [
            { products: { some: {} } },
            { variations: { some: {} } },
          ],
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      withProducts,
    };
  }
}
