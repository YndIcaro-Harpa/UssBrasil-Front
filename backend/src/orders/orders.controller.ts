import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto, UpdateOrderDto } from './orders.service';

interface NotifyOrderDto {
  status: string;
  channels: ('email' | 'whatsapp')[];
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  create(@Body() createOrderDto: CreateOrderDto) {
    console.log('🔍 Controller: Recebendo requisição para criar pedido:', JSON.stringify(createOrderDto, null, 2));
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos com filtros e paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.ordersService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      userId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas dos pedidos' })
  getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obter pedidos recentes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecent(@Query('limit') limit: string = '10') {
    return this.ordersService.getRecentOrders(parseInt(limit));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter pedidos de um usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.ordersService.findByUser(userId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pedido por ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: UpdateOrderDto['status'] },
  ) {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Atualizar status de pagamento' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: UpdateOrderDto['paymentStatus'] },
  ) {
    return this.ordersService.updatePaymentStatus(id, body.paymentStatus);
  }

  @Patch('bulk/status')
  @ApiOperation({ summary: 'Atualizar status de múltiplos pedidos' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  bulkUpdateStatus(
    @Body() body: { ids: string[]; status: UpdateOrderDto['status']; sendNotification?: boolean },
  ) {
    return this.ordersService.bulkUpdateStatus(body.ids, body.status, body.sendNotification);
  }

  @Patch('bulk/payment')
  @ApiOperation({ summary: 'Atualizar status de pagamento de múltiplos pedidos' })
  @ApiResponse({ status: 200, description: 'Status de pagamento atualizado com sucesso' })
  bulkUpdatePaymentStatus(
    @Body() body: { ids: string[]; paymentStatus: UpdateOrderDto['paymentStatus'] },
  ) {
    return this.ordersService.bulkUpdatePaymentStatus(body.ids, body.paymentStatus);
  }

  @Get('export/data')
  @ApiOperation({ summary: 'Exportar pedidos (JSON ou CSV)' })
  @ApiQuery({ name: 'format', required: false, type: String, enum: ['json', 'csv'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  exportOrders(
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.exportOrders(
      format,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      status,
    );
  }

  @Post(':id/notify')
  @ApiOperation({ summary: 'Enviar notificação do pedido (email e/ou WhatsApp)' })
  @ApiResponse({ status: 200, description: 'Notificação enviada com sucesso' })
  async sendNotification(
    @Param('id') id: string,
    @Body() body: NotifyOrderDto,
  ) {
    return this.ordersService.sendOrderNotification(id, body.status, body.channels);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Processar reembolso do pedido' })
  @ApiResponse({ status: 200, description: 'Reembolso processado com sucesso' })
  async processRefund(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.ordersService.processRefund(id, body.reason);
  }
}