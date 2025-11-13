import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  shippingAddress: any;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount?: number;
  couponId?: string;
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface UpdateOrderDto {
  status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  trackingCode?: string;
  notes?: string;
  estimatedDelivery?: Date;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;
    
    // Calcular total
    const total = orderData.subtotal + orderData.shipping - (orderData.discount || 0);

    // Criar pedido com itens
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        total,
        orderItems: {
          create: items,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        coupon: true,
      },
    });

    // Atualizar estoque dos produtos
    for (const item of items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    return order;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
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
                  slug: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          coupon: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, undefined, userId);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coupon: true,
      },
    });
  }

  async updateStatus(id: string, status: UpdateOrderDto['status']) {
    const updateData: any = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    return this.update(id, updateData);
  }

  async updatePaymentStatus(id: string, paymentStatus: UpdateOrderDto['paymentStatus']) {
    return this.update(id, { paymentStatus });
  }

  async getOrderStats() {
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
    };
  }

  async getRecentOrders(limit: number = 10) {
    return this.prisma.order.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}