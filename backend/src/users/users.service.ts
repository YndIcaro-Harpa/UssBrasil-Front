import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se CPF já existe (se fornecido)
    if (createUserDto.cpf) {
      const existingCpf = await this.prisma.user.findUnique({
        where: { cpf: createUserDto.cpf },
      });
      if (existingCpf) {
        throw new ConflictException('CPF já está em uso');
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        phone: createUserDto.phone,
        cpf: createUserDto.cpf,
        address: createUserDto.address,
        city: createUserDto.city,
        state: createUserDto.state,
        zipCode: createUserDto.zipCode,
        role: createUserDto.role || 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Soft delete - desativa usuário ao invés de deletar
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async changePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Estatísticas de usuários
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersWithOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)), // Primeiro dia do mês
          },
        },
      }),
      this.prisma.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),
    ]);

    // Valor total gasto por todos os usuários
    const totalSpent = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersThisMonth,
      usersWithOrders,
      conversionRate: totalUsers > 0 ? ((usersWithOrders / totalUsers) * 100).toFixed(1) : 0,
      totalRevenue: totalSpent._sum.total || 0,
      averageRevenuePerUser: totalUsers > 0 ? (totalSpent._sum.total || 0) / totalUsers : 0,
    };
  }

  // Histórico de pedidos do usuário
  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    // Calcular total gasto pelo usuário
    const totalSpent = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { userId, paymentStatus: 'PAID' },
    });

    return {
      orders,
      totalSpent: totalSpent._sum.total || 0,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Lista de clientes com estatísticas (para admin)
  async getCustomers(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      // SQLite doesn't support mode: 'insensitive', using contains only
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          orders: {
            select: {
              id: true,
              total: true,
              createdAt: true,
              paymentStatus: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { orders: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Mapear para incluir estatísticas
    const customersWithStats = customers.map(customer => {
      const paidOrders = customer.orders.filter(o => o.paymentStatus === 'PAID');
      const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = customer.orders[0];

      return {
        id: customer.id,
        name: customer.name || 'Sem nome',
        email: customer.email,
        phone: customer.phone || '',
        cpf: customer.cpf || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        status: customer.isActive ? 'active' : 'inactive',
        totalOrders: customer._count.orders,
        totalSpent,
        lastOrder: lastOrder?.createdAt || null,
        registeredAt: customer.createdAt,
        location: {
          city: customer.city || 'Não informado',
          state: customer.state || '',
        },
        loyaltyPoints: Math.floor(totalSpent / 10), // 1 ponto a cada R$ 10
        averageRating: 4.5, // Placeholder - implementar quando tiver reviews
      };
    });

    return {
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}