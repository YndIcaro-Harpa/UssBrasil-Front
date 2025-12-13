'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Package, User, MapPin, Truck, CreditCard, 
  Mail, Phone, Calendar, Clock, DollarSign, 
  TrendingUp, TrendingDown, Percent, Hash,
  Send, MessageCircle, Copy, ExternalLink,
  CheckCircle, AlertTriangle, RefreshCw,
  Printer, FileText, Receipt, Box,
  ChevronRight, Palette, HardDrive, Scale,
  Tag, ShoppingBag, Loader2, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

// Constantes de taxas (mesmas do módulo de precificação)
const TAXA_CARTAO = 0.05; // 5% taxa cartão
const TAXA_GATEWAY = 0.035; // 3.5% gateway
const TAXA_IMPOSTOS = 0.065; // 6.5% impostos
const TAXA_TOTAL = 0.15; // 15% total

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedColorCode?: string;
  selectedStorage?: string;
  selectedSize?: string;
  variationId?: string;
  productName?: string;
  productSku?: string;
  productImage?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    images: string;
    costPrice?: number;
    price: number;
    discountPrice?: number;
    weight?: number;
    brand?: { name: string };
    category?: { name: string };
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: any;
  trackingCode?: string;
  notes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  installments?: number;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    image?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    createdAt?: string;
  };
  coupon?: {
    code: string;
    type: string;
    value: number;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange?: (orderId: string, status: string) => Promise<void>;
  onSendNotification?: (orderId: string, type: 'email' | 'whatsapp', status: string) => Promise<void>;
  token?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300', icon: Clock },
  PROCESSING: { label: 'Processando', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-300', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-300', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300', icon: X },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Aguardando', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  PAID: { label: 'Pago', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  FAILED: { label: 'Falhou', color: 'text-red-700', bgColor: 'bg-red-100' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BOLETO: 'Boleto Bancário',
  CASH: 'Dinheiro',
};

export function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onStatusChange,
  onSendNotification,
  token 
}: OrderDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('resumo');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [financials, setFinancials] = useState({
    custoTotal: 0,
    taxaCartao: 0,
    taxaGateway: 0,
    taxaImpostos: 0,
    taxasTotal: 0,
    lucroLiquido: 0,
    margemLucro: 0,
  });

  // Extrair itens do pedido
  const items = order?.items || order?.orderItems || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular financeiros quando o pedido mudar
  useEffect(() => {
    if (!order) return;

    let custoTotal = 0;
    
    // Calcular custo total dos produtos
    items.forEach(item => {
      const costPrice = item.product?.costPrice || item.product?.price || item.price;
      custoTotal += costPrice * item.quantity;
    });

    // Calcular taxas baseadas no total
    const valorVenda = order.total;
    const taxaCartao = valorVenda * TAXA_CARTAO;
    const taxaGateway = valorVenda * TAXA_GATEWAY;
    const taxaImpostos = valorVenda * TAXA_IMPOSTOS;
    const taxasTotal = taxaCartao + taxaGateway + taxaImpostos;

    // Lucro líquido
    const lucroLiquido = valorVenda - custoTotal - taxasTotal - order.shipping;
    const margemLucro = valorVenda > 0 ? (lucroLiquido / valorVenda) * 100 : 0;

    setFinancials({
      custoTotal,
      taxaCartao,
      taxaGateway,
      taxaImpostos,
      taxasTotal,
      lucroLiquido,
      margemLucro,
    });
  }, [order, items]);

  // Funções utilitárias
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const getProductImage = (item: OrderItem): string => {
    if (item.productImage) return item.productImage;
    if (item.product?.images) {
      try {
        const images = item.product.images;
        if (typeof images === 'string') {
          if (images.includes(',')) {
            return images.split(',')[0].trim();
          }
          try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
              return parsed[0]?.url || parsed[0] || '/placeholder.png';
            }
          } catch {
            return images;
          }
        }
      } catch {
        return '/placeholder.png';
      }
    }
    return '/placeholder.png';
  };

  const parseAddress = (address: any) => {
    if (!address) return null;
    let parsed = address;
    
    if (typeof address === 'string') {
      try {
        parsed = JSON.parse(address);
      } catch {
        return { raw: address };
      }
    }
    
    // Normalizar campos do endereço (API pode retornar em português ou inglês)
    return {
      name: parsed.name || parsed.nome,
      street: parsed.street || parsed.rua || parsed.logradouro,
      number: parsed.number || parsed.numero,
      complement: parsed.complement || parsed.complemento,
      neighborhood: parsed.neighborhood || parsed.bairro,
      city: parsed.city || parsed.cidade,
      state: parsed.state || parsed.estado,
      zipCode: parsed.zipCode || parsed.cep || parsed.zip_code,
      raw: parsed.raw
    };
  };

  // Handlers
  const handleSendEmail = async () => {
    if (!order || !onSendNotification) return;
    setSendingEmail(true);
    try {
      await onSendNotification(order.id, 'email', order.status);
      toast.success('Email enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!order?.user?.phone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }
    
    const phone = order.user.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${order.user.name}! 🛍️\n\n` +
      `Seu pedido #${order.id.slice(-8).toUpperCase()} está com status: ${statusConfig[order.status]?.label || order.status}\n\n` +
      `Total: ${formatCurrency(order.total)}\n\n` +
      `Obrigado por comprar na USS Brasil! 💙`
    );
    
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp aberto!');
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !onStatusChange) return;
    setUpdatingStatus(true);
    try {
      await onStatusChange(order.id, newStatus);
      toast.success(`Status atualizado para ${statusConfig[newStatus]?.label}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  const address = parseAddress(order.shippingAddress);
  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header com informações principais */}
        <DialogHeader className="bg-gradient-to-r from-[#001a4d] to-[#002d7a] text-white p-5 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Pedido #{order.id.slice(-8).toUpperCase()}
                  <button 
                    onClick={() => copyToClipboard(order.id, 'ID do pedido')}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Badges de status */}
            <div className="flex flex-col gap-2 items-end">
              <Badge className={`${statusConfig[order.status]?.bgColor} ${statusConfig[order.status]?.color} border px-3 py-1`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig[order.status]?.label || order.status}
              </Badge>
              <Badge className={`${paymentStatusConfig[order.paymentStatus]?.bgColor} ${paymentStatusConfig[order.paymentStatus]?.color} px-3 py-1`}>
                {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs de navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start gap-1 bg-gray-50 p-1 rounded-none border-b">
            <TabsTrigger value="resumo" className="data-[state=active]:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-white">
              <Package className="w-4 h-4 mr-2" />
              Produtos ({totalItems})
            </TabsTrigger>
            <TabsTrigger value="cliente" className="data-[state=active]:bg-white">
              <User className="w-4 h-4 mr-2" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:bg-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="acoes" className="data-[state=active]:bg-white">
              <Send className="w-4 h-4 mr-2" />
              Ações
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Tab Resumo */}
            <TabsContent value="resumo" className="mt-0 space-y-5">
              {/* Cards de métricas principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-1">
                    <DollarSign className="w-4 h-4" />
                    Total do Pedido
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(order.total)}</p>
                </div>

                <div className={`rounded-xl p-4 border ${
                  financials.margemLucro >= 20 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' 
                    : financials.margemLucro >= 10 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${
                    financials.margemLucro >= 20 ? 'text-blue-600' : financials.margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    Lucro Líquido
                  </div>
                  <p className={`text-2xl font-bold ${
                    financials.margemLucro >= 20 ? 'text-blue-700' : financials.margemLucro >= 10 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(financials.lucroLiquido)}
                  </p>
                  <p className={`text-sm ${
                    financials.margemLucro >= 20 ? 'text-blue-600' : financials.margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {financials.margemLucro.toFixed(1)}% margem
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-1">
                    <Box className="w-4 h-4" />
                    Qtd. Produtos
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{totalItems}</p>
                  <p className="text-sm text-purple-600">{items.length} SKUs diferentes</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-1">
                    <Percent className="w-4 h-4" />
                    Taxas Totais
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{formatCurrency(financials.taxasTotal)}</p>
                  <p className="text-sm text-orange-600">15% do total</p>
                </div>
              </div>

              {/* Resumo de valores */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Valores do pedido */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Valores do Pedido
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} itens)</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frete</span>
                      <span className="font-medium">{order.shipping > 0 ? formatCurrency(order.shipping) : 'Grátis'}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto {order.coupon && `(${order.coupon.code})`}</span>
                        <span className="font-medium">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-emerald-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Pagamento */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Pagamento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Método</span>
                      <span className="font-medium">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                    </div>
                    {order.installments && order.installments > 1 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Parcelas</span>
                        <span className="font-medium">{order.installments}x de {formatCurrency(order.total / order.installments)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className={`${paymentStatusConfig[order.paymentStatus]?.bgColor} ${paymentStatusConfig[order.paymentStatus]?.color}`}>
                        {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                      </Badge>
                    </div>
                    {order.stripePaymentIntentId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stripe ID</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {order.stripePaymentIntentId.slice(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço e Timeline */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Endereço de entrega */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Endereço de Entrega
                  </h3>
                  {address ? (
                    <div className="space-y-2 text-sm">
                      {address.raw ? (
                        <p className="text-gray-700">{address.raw}</p>
                      ) : (
                        <>
                          <p className="text-gray-700">
                            {address.street}{address.number ? `, ${address.number}` : ''}
                          </p>
                          {address.complement && <p className="text-gray-600">{address.complement}</p>}
                          {address.neighborhood && <p className="text-gray-600">{address.neighborhood}</p>}
                          <p className="text-gray-700">
                            {address.city} - {address.state}
                          </p>
                          <p className="text-gray-600">CEP: {address.zipCode}</p>
                        </>
                      )}
                      {order.trackingCode && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-700 font-medium">Código de Rastreio:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-purple-800 font-mono">{order.trackingCode}</code>
                            <button 
                              onClick={() => copyToClipboard(order.trackingCode!, 'Código de rastreio')}
                              className="p-1 hover:bg-purple-100 rounded"
                            >
                              <Copy className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Endereço não informado</p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Timeline do Pedido
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Pedido criado</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    
                    {order.paymentStatus === 'PAID' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Pagamento confirmado</p>
                          <p className="text-sm text-gray-500">{paymentMethodLabels[order.paymentMethod]}</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'SHIPPED' && order.trackingCode && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Enviado</p>
                          <p className="text-sm text-gray-500">Rastreio: {order.trackingCode}</p>
                        </div>
                      </div>
                    )}

                    {order.deliveredAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Entregue</p>
                          <p className="text-sm text-gray-500">{formatDate(order.deliveredAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notas */}
              {order.notes && (
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
                  <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observações do Pedido
                  </h3>
                  <p className="text-yellow-900">{order.notes}</p>
                </div>
              )}
            </TabsContent>

            {/* Tab Produtos */}
            <TabsContent value="produtos" className="mt-0">
              <div className="space-y-4">
                {items.map((item, index) => {
                  const costPrice = item.product?.costPrice || item.product?.price || item.price;
                  const itemProfit = (item.price - costPrice) * item.quantity;
                  const itemTaxes = item.price * item.quantity * TAXA_TOTAL;
                  const itemNetProfit = itemProfit - itemTaxes;

                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl border p-4"
                    >
                      <div className="flex gap-4">
                        {/* Imagem */}
                        <div className="relative w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={getProductImage(item)}
                            alt={item.product?.name || item.productName || 'Produto'}
                            fill
                            className="object-contain p-2"
                          />
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            {item.quantity}x
                          </div>
                        </div>

                        {/* Informações do produto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 truncate">
                                {item.product?.name || item.productName || 'Produto'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {item.product?.brand && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.product.brand.name}
                                  </Badge>
                                )}
                                {item.product?.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.product.category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(item.price)} un.
                              </p>
                            </div>
                          </div>

                          {/* Variações selecionadas */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.selectedColor && (
                              <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-sm">
                                <div 
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: item.selectedColorCode || item.selectedColor }}
                                />
                                <span className="text-gray-700">{item.selectedColor}</span>
                              </div>
                            )}
                            {item.selectedStorage && (
                              <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-sm">
                                <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-gray-700">{item.selectedStorage}</span>
                              </div>
                            )}
                            {item.selectedSize && (
                              <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-sm">
                                <Scale className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-gray-700">{item.selectedSize}</span>
                              </div>
                            )}
                            {item.product?.sku && (
                              <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-sm">
                                <Tag className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-gray-700 font-mono">{item.product.sku}</span>
                              </div>
                            )}
                          </div>

                          {/* Métricas financeiras do item */}
                          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
                            <div>
                              <p className="text-xs text-gray-500">Custo</p>
                              <p className="font-medium text-gray-700">{formatCurrency(costPrice * item.quantity)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Taxas (15%)</p>
                              <p className="font-medium text-orange-600">{formatCurrency(itemTaxes)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Lucro Líq.</p>
                              <p className={`font-bold ${itemNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(itemNetProfit)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Resumo dos produtos */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Total de Itens</p>
                      <p className="text-xl font-bold text-gray-900">{totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">SKUs Diferentes</p>
                      <p className="text-xl font-bold text-gray-900">{items.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(order.subtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Cliente */}
            <TabsContent value="cliente" className="mt-0">
              {order.user ? (
                <div className="space-y-5">
                  {/* Card principal do cliente */}
                  <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white">
                        {order.user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{order.user.name}</h3>
                        <p className="text-gray-500">Cliente desde {order.user.createdAt ? formatDateShort(order.user.createdAt) : 'N/A'}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{order.user.email}</span>
                            <button 
                              onClick={() => copyToClipboard(order.user!.email, 'Email')}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                          {order.user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{order.user.phone}</span>
                              <button 
                                onClick={() => copyToClipboard(order.user!.phone!, 'Telefone')}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Dados cadastrais */}
                    <div className="bg-white rounded-xl border p-5">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Dados Cadastrais
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ID do Cliente</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.user.id.slice(0, 12)}...</span>
                        </div>
                        {order.user.cpf && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">CPF</span>
                            <span className="font-medium">{order.user.cpf}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email</span>
                          <span className="font-medium">{order.user.email}</span>
                        </div>
                        {order.user.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Telefone</span>
                            <span className="font-medium">{order.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Endereço cadastrado */}
                    <div className="bg-white rounded-xl border p-5">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Endereço Cadastrado
                      </h4>
                      {order.user.address ? (
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">{order.user.address}</p>
                          {(order.user.city || order.user.state) && (
                            <p className="text-gray-600">
                              {order.user.city}{order.user.state && ` - ${order.user.state}`}
                            </p>
                          )}
                          {order.user.zipCode && (
                            <p className="text-gray-500">CEP: {order.user.zipCode}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Endereço não cadastrado</p>
                      )}
                    </div>
                  </div>

                  {/* Ações rápidas */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      Enviar Email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSendWhatsapp}
                      disabled={!order.user.phone}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Dados do cliente não disponíveis</p>
                </div>
              )}
            </TabsContent>

            {/* Tab Financeiro */}
            <TabsContent value="financeiro" className="mt-0">
              <div className="space-y-5">
                {/* Resumo financeiro */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 opacity-90 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-medium">Receita Total</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(order.total)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 opacity-90 mb-2">
                      <TrendingDown className="w-5 h-5" />
                      <span className="text-sm font-medium">Custos + Taxas</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(financials.custoTotal + financials.taxasTotal)}</p>
                  </div>

                  <div className={`rounded-xl p-5 text-white ${
                    financials.lucroLiquido >= 0 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 opacity-90 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm font-medium">Lucro Líquido</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(financials.lucroLiquido)}</p>
                    <p className="text-sm opacity-90 mt-1">{financials.margemLucro.toFixed(1)}% de margem</p>
                  </div>
                </div>

                {/* Breakdown detalhado */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Detalhamento Financeiro
                  </h3>

                  <div className="space-y-4">
                    {/* Receita */}
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">Receita</h4>
                      <div className="space-y-2 pl-4 border-l-2 border-emerald-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal dos Produtos</span>
                          <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Frete Cobrado</span>
                          <span className="font-medium">{formatCurrency(order.shipping)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>Desconto Aplicado</span>
                            <span className="font-medium">-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t">
                          <span className="text-emerald-700">Total Recebido</span>
                          <span className="text-emerald-700">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Custos */}
                    <div>
                      <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">Custos</h4>
                      <div className="space-y-2 pl-4 border-l-2 border-red-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custo dos Produtos</span>
                          <span className="font-medium">{formatCurrency(financials.custoTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Frete (custo)</span>
                          <span className="font-medium">{formatCurrency(order.shipping)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Taxas */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Taxas (15% do total)</h4>
                      <div className="space-y-2 pl-4 border-l-2 border-orange-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taxa do Cartão (5%)</span>
                          <span className="font-medium">{formatCurrency(financials.taxaCartao)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taxa do Gateway (3.5%)</span>
                          <span className="font-medium">{formatCurrency(financials.taxaGateway)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Impostos (6.5%)</span>
                          <span className="font-medium">{formatCurrency(financials.taxaImpostos)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t">
                          <span className="text-orange-700">Total de Taxas</span>
                          <span className="text-orange-700">{formatCurrency(financials.taxasTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className={`p-4 rounded-xl ${
                      financials.lucroLiquido >= 0 
                        ? financials.margemLucro >= 20 
                          ? 'bg-emerald-50 border border-emerald-200' 
                          : financials.margemLucro >= 10 
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-red-50 border border-red-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-bold ${
                            financials.lucroLiquido >= 0 && financials.margemLucro >= 20 
                              ? 'text-emerald-700' 
                              : financials.margemLucro >= 10 
                                ? 'text-yellow-700'
                                : 'text-red-700'
                          }`}>
                            Lucro Líquido Final
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Margem de {financials.margemLucro.toFixed(1)}% • 
                            {financials.margemLucro >= 20 && ' ✅ Margem ideal'}
                            {financials.margemLucro >= 10 && financials.margemLucro < 20 && ' ⚠️ Margem de atenção'}
                            {financials.margemLucro < 10 && ' ❌ Margem crítica'}
                          </p>
                        </div>
                        <p className={`text-3xl font-bold ${
                          financials.lucroLiquido >= 0 && financials.margemLucro >= 20 
                            ? 'text-emerald-600' 
                            : financials.margemLucro >= 10 
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}>
                          {formatCurrency(financials.lucroLiquido)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info adicional sobre taxas */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Informações sobre Taxas
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Taxa do Cartão (5%):</strong> Cobrança das operadoras de cartão de crédito/débito</li>
                    <li>• <strong>Taxa do Gateway (3.5%):</strong> Tarifa do Stripe para processamento do pagamento</li>
                    <li>• <strong>Impostos (6.5%):</strong> Simples Nacional, ICMS e outras tributações</li>
                    <li className="pt-2 font-medium">💡 Margem ideal para e-commerce: ≥ 20% de lucro líquido</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Tab Ações */}
            <TabsContent value="acoes" className="mt-0">
              <div className="space-y-5">
                {/* Atualizar Status */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    Atualizar Status do Pedido
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon;
                      const isActive = order.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={updatingStatus || isActive}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            isActive 
                              ? `${config.bgColor} border-current ${config.color}` 
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                          } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notificações */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-600" />
                    Enviar Notificações
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-3"
                    >
                      {sendingEmail ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      ) : (
                        <Mail className="w-8 h-8 text-blue-600" />
                      )}
                      <div className="text-left">
                        <p className="font-bold text-blue-800">Enviar Email</p>
                        <p className="text-sm text-blue-600">Notificar cliente por email</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSendWhatsapp}
                      disabled={!order.user?.phone}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        order.user?.phone 
                          ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className={`w-8 h-8 ${order.user?.phone ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <p className={`font-bold ${order.user?.phone ? 'text-green-800' : 'text-gray-600'}`}>
                          WhatsApp
                        </p>
                        <p className={`text-sm ${order.user?.phone ? 'text-green-600' : 'text-gray-500'}`}>
                          {order.user?.phone ? 'Abrir conversa' : 'Telefone não cadastrado'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Outras ações */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Outras Ações
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" onClick={handlePrint} className="flex flex-col h-auto py-3">
                      <Printer className="w-5 h-5 mb-1" />
                      <span className="text-xs">Imprimir</span>
                    </Button>
                    <Button variant="outline" onClick={() => copyToClipboard(order.id, 'ID do pedido')} className="flex flex-col h-auto py-3">
                      <Copy className="w-5 h-5 mb-1" />
                      <span className="text-xs">Copiar ID</span>
                    </Button>
                    {order.trackingCode && (
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`https://www.linkcorreios.com.br/?id=${order.trackingCode}`, '_blank')}
                        className="flex flex-col h-auto py-3"
                      >
                        <ExternalLink className="w-5 h-5 mb-1" />
                        <span className="text-xs">Rastrear</span>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="flex flex-col h-auto py-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                    >
                      <X className="w-5 h-5 mb-1" />
                      <span className="text-xs">Cancelar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Última atualização: {formatDate(order.updatedAt)}
          </p>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailsModal;
