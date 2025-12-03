import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';

export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  shippingAddress: any;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount?: number;
  couponId?: string;
  saleType?: 'online' | 'presencial';
  notes?: string;
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
    private emailService: EmailService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, shippingAddress, ...orderData } = createOrderDto;
    
    // Calcular total
    const total = orderData.subtotal + orderData.shipping - (orderData.discount || 0);

    // Converter shippingAddress para string JSON se for objeto
    const shippingAddressStr = typeof shippingAddress === 'object' 
      ? JSON.stringify(shippingAddress) 
      : shippingAddress;

    // Criar pedido com itens
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        shippingAddress: shippingAddressStr,
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

    // Enviar email de confirmação do pedido
    if (order.user?.email) {
      const itemsForEmail = order.orderItems.map(item => ({
        name: item.product?.name || 'Produto',
        quantity: item.quantity,
        price: item.price,
      }));
      
      const shippingAddressStr = typeof order.shippingAddress === 'object' 
        ? Object.values(order.shippingAddress).filter(Boolean).join(', ')
        : String(order.shippingAddress || '');

      this.emailService.sendOrderConfirmation(
        order.user.email,
        order.user.name || 'Cliente',
        order.id,
        itemsForEmail,
        order.total,
        shippingAddressStr,
      ).catch(err => console.error('Erro ao enviar email de confirmação:', err));
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

    const order = await this.update(id, updateData);

    // Enviar email de atualização de status
    if (order.user?.email) {
      this.emailService.sendOrderStatusUpdate(
        order.user.email,
        order.user.name || 'Cliente',
        order.id,
        status!,
        (order as any).trackingCode,
      ).catch(err => console.error('Erro ao enviar email de status:', err));
    }

    return order;
  }

  async bulkUpdateStatus(ids: string[], status: UpdateOrderDto['status'], sendNotification: boolean = false) {
    const updateData: any = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const result = await this.prisma.order.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    // Enviar notificações em background se solicitado
    if (sendNotification) {
      ids.forEach(orderId => {
        this.sendOrderNotification(orderId, status!, ['email'])
          .catch(err => console.error(`Erro ao enviar notificação para ${orderId}:`, err));
      });
    }

    return {
      success: true,
      updatedCount: result.count,
      ids,
      status,
    };
  }

  async bulkUpdatePaymentStatus(ids: string[], paymentStatus: UpdateOrderDto['paymentStatus']) {
    const result = await this.prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { paymentStatus },
    });

    return {
      success: true,
      updatedCount: result.count,
      ids,
      paymentStatus,
    };
  }

  async exportOrders(
    format: 'json' | 'csv' = 'json',
    startDate?: Date,
    endDate?: Date,
    status?: string,
  ) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    if (status) where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
        },
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const csvLines = [
        'ID,Data,Cliente,Email,Status,Status Pagamento,Total,Itens',
      ];
      
      for (const order of orders) {
        const itemsStr = order.orderItems
          .map(i => `${i.quantity}x ${i.product?.name || 'Produto'}`)
          .join('; ');
        
        csvLines.push(
          `"${order.id}","${order.createdAt.toISOString()}","${order.user?.name || ''}","${order.user?.email || ''}","${order.status}","${order.paymentStatus}","${order.total}","${itemsStr}"`
        );
      }
      
      return {
        format: 'csv',
        data: csvLines.join('\n'),
        count: orders.length,
      };
    }

    return {
      format: 'json',
      data: orders,
      count: orders.length,
    };
  }

  async updatePaymentStatus(id: string, paymentStatus: UpdateOrderDto['paymentStatus']) {
    const order = await this.update(id, { paymentStatus });

    // Enviar email de confirmação de pagamento
    if (paymentStatus === 'PAID' && order.user?.email) {
      this.emailService.sendPaymentConfirmation(
        order.user.email,
        order.user.name || 'Cliente',
        order.id,
        order.total,
        (order as any).paymentMethod || 'CREDIT_CARD',
      ).catch(err => console.error('Erro ao enviar email de pagamento:', err));
    }

    return order;
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

  // Enviar notificação para o cliente (email e WhatsApp)
  async sendOrderNotification(
    orderId: string, 
    status: string, 
    channels: ('email' | 'whatsapp')[] = ['email']
  ) {
    const order = await this.findOne(orderId);
    
    const statusMessages: Record<string, string> = {
      'PENDING': 'Seu pedido foi recebido e está aguardando confirmação.',
      'PROCESSING': 'Seu pedido está sendo preparado para envio.',
      'SHIPPED': 'Seu pedido foi enviado! Em breve você receberá o código de rastreamento.',
      'DELIVERED': 'Seu pedido foi entregue! Esperamos que você aproveite sua compra.',
      'CANCELLED': 'Seu pedido foi cancelado. Se você tiver dúvidas, entre em contato conosco.',
      'REFUNDED': 'O reembolso do seu pedido foi processado. O valor será creditado em até 7 dias úteis.',
    };

    const results = {
      email: false,
      whatsapp: false,
    };

    // Enviar email
    if (channels.includes('email') && order.user?.email) {
      try {
        await this.emailService.sendOrderStatusUpdate(
          order.user.email,
          order.user.name || 'Cliente',
          order.id,
          status,
          (order as any).trackingCode,
        );
        results.email = true;
      } catch (err) {
        console.error('Erro ao enviar email:', err);
      }
    }

    // Simular envio de WhatsApp (integração real requer API como Twilio, WhatsApp Business API, etc.)
    if (channels.includes('whatsapp') && (order.user as any)?.phone) {
      try {
        const phone = (order.user as any).phone.replace(/\D/g, '');
        const message = `Olá ${order.user?.name || 'Cliente'}! 🛍️\n\n${statusMessages[status] || 'Atualização do seu pedido.'}\n\nPedido: #${order.id.slice(0, 8)}\n\n- Equipe USS Brasil`;
        
        // Log para debug - Em produção, integrar com WhatsApp Business API
        console.log(`[WhatsApp Notification] Para: ${phone}\nMensagem: ${message}`);
        
        // Aqui você integraria com Twilio, WhatsApp Business API, etc.
        // await this.whatsappService.sendMessage(phone, message);
        
        results.whatsapp = true;
      } catch (err) {
        console.error('Erro ao enviar WhatsApp:', err);
      }
    }

    // Criar notificação interna para o usuário
    await this.createUserNotification(order.userId, orderId, status);

    return {
      success: true,
      orderId,
      status,
      channels: results,
      message: 'Notificação processada',
    };
  }

  // Criar notificação interna para o usuário
  private async createUserNotification(userId: string, orderId: string, status: string) {
    // Você pode criar uma tabela de notificações ou usar outro sistema
    // Por agora, vamos apenas logar
    console.log(`[User Notification] User: ${userId}, Order: ${orderId}, Status: ${status}`);
    
    // Se existir uma tabela de notificações:
    // await this.prisma.notification.create({
    //   data: {
    //     userId,
    //     type: 'ORDER_STATUS',
    //     title: 'Atualização do Pedido',
    //     message: `Seu pedido #${orderId.slice(0, 8)} foi atualizado para ${status}`,
    //     data: { orderId, status },
    //   }
    // });
  }

  // Processar reembolso
  async processRefund(orderId: string, reason?: string) {
    const order = await this.findOne(orderId);
    
    if (order.paymentStatus === 'REFUNDED') {
      throw new Error('Este pedido já foi reembolsado');
    }

    // Atualizar status do pagamento
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
        notes: reason ? `Reembolso: ${reason}` : 'Pedido reembolsado',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: true,
      },
    });

    // Restaurar estoque dos produtos
    for (const item of updatedOrder.orderItems) {
      await this.productsService.updateStock(item.productId, -item.quantity);
    }

    // Enviar notificação de reembolso
    await this.sendOrderNotification(orderId, 'REFUNDED', ['email', 'whatsapp']);

    return {
      success: true,
      orderId,
      refundAmount: order.total,
      message: 'Reembolso processado com sucesso',
    };
  }
}