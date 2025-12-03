'use client'

export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Loader2,
  RefreshCw,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Copy,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  Undo2,
  FileText,
  Calendar,
  Hash,
  ShoppingBag,
  Receipt,
  Banknote,
  Building,
  Globe,
  ChevronRight,
  CheckCircle2,
  PackageCheck,
  Printer,
  Download
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import PremiumButton from '@/components/ui/PremiumButton'
import { api, Order } from '@/services/api'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/useAdminAuth'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

// Extended Order type with Stripe fields
interface ExtendedOrder extends Order {
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  installments?: number
  orderItems?: any[]
  deliveredAt?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAdminAuth()
  const orderId = params?.id as string
  
  const [order, setOrder] = useState<ExtendedOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState<number | null>(null)
  const [sendingNotification, setSendingNotification] = useState(false)

  const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: any; nextStatus?: OrderStatus }> = {
    PENDING: {
      label: 'Pendente',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Clock,
      nextStatus: 'PROCESSING'
    },
    PROCESSING: {
      label: 'Empacotando',
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      icon: Package,
      nextStatus: 'SHIPPED'
    },
    SHIPPED: {
      label: 'Enviado',
      color: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      icon: Truck,
      nextStatus: 'DELIVERED'
    },
    DELIVERED: {
      label: 'Entregue',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle
    },
    CANCELLED: {
      label: 'Cancelado',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: XCircle
    }
  }

  const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    PENDING: { label: 'Aguardando Pagamento', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: Clock },
    PAID: { label: 'Pago', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: CheckCircle },
    FAILED: { label: 'Falhou', color: 'text-red-700', bgColor: 'bg-red-50', icon: XCircle },
    REFUNDED: { label: 'Reembolsado', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Undo2 }
  }

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    
    setLoading(true)
    try {
      const data = await api.orders.getById(orderId)
      setOrder(data)
    } catch (error: any) {
      console.error('[Order Detail] Erro:', error)
      toast.error('Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return
    
    setUpdating(true)
    try {
      await api.orders.updateStatus(order.id, newStatus, token || undefined)
      toast.success(`Status atualizado para ${statusConfig[newStatus].label}`)
      await sendOrderNotification(newStatus)
      fetchOrder()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  const sendOrderNotification = async (status: string) => {
    if (!order) return
    
    setSendingNotification(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${order.id}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, channels: ['email', 'whatsapp'] })
      })
      toast.success('Notificação enviada ao cliente')
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    } finally {
      setSendingNotification(false)
    }
  }

  const handleRefund = async () => {
    if (!order) return
    
    setUpdating(true)
    try {
      // 1. Primeiro, processar o reembolso no Stripe (se houver stripePaymentIntentId)
      if (order.stripePaymentIntentId) {
        const refundResult = await api.stripe.createRefund({
          paymentIntentId: order.stripePaymentIntentId,
          amount: refundAmount || undefined,
          reason: 'requested_by_customer'
        })
        
        if (refundResult.status !== 'succeeded' && refundResult.status !== 'pending') {
          throw new Error(`Falha no reembolso Stripe: ${refundResult.status}`)
        }
        
        toast.success(`Reembolso Stripe processado: ${formatCurrency(refundResult.amount)}`)
      }
      
      // 2. Atualizar status do pagamento no banco
      await api.orders.updatePaymentStatus(order.id, 'REFUNDED', token || undefined)
      
      // 3. Atualizar status do pedido para cancelado
      await api.orders.updateStatus(order.id, 'CANCELLED', token || undefined)
      
      // 4. Enviar notificação ao cliente
      await sendOrderNotification('REFUNDED')
      
      toast.success('Reembolso processado com sucesso')
      setShowRefundModal(false)
      setRefundReason('')
      setRefundAmount(null)
      fetchOrder()
    } catch (error: any) {
      console.error('[Refund] Erro:', error)
      toast.error(error.message || 'Erro ao processar reembolso')
    } finally {
      setUpdating(false)
    }
  }

  const parseAddress = (address: any): string => {
    if (!address) return 'Endereço não informado'
    
    try {
      const parsed = typeof address === 'string' ? JSON.parse(address) : address
      return [
        parsed.street,
        parsed.number,
        parsed.complement,
        parsed.neighborhood,
        parsed.city,
        parsed.state,
        parsed.zipCode,
        parsed.country
      ].filter(Boolean).join(', ')
    } catch {
      return String(address)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-uss-primary" />
          <p className="text-gray-500">Carregando detalhes do pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
          <p className="text-gray-500 mb-4">O pedido solicitado não existe ou foi removido.</p>
          <PremiumButton onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pedidos
          </PremiumButton>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status as OrderStatus] || statusConfig.PENDING
  const paymentInfo = paymentStatusConfig[order.paymentStatus as PaymentStatus] || paymentStatusConfig.PENDING
  const StatusIcon = statusInfo.icon
  const PaymentIcon = paymentInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Pedido #${order.id.slice(0, 8).toUpperCase()}`}
        description={`Criado em ${formatDate(order.createdAt)}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Pedidos', href: '/admin/orders' },
          { label: `#${order.id.slice(0, 8).toUpperCase()}` }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchOrder}
            >
              Atualizar
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Imprimir
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/admin/orders')}
            >
              Voltar
            </PremiumButton>
          </div>
        }
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 p-5 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Status do Pedido</h3>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <p className={`text-2xl font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              
              {/* Status Progress */}
              <div className="mt-4 flex items-center gap-1">
                {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, i) => {
                  const isActive = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(order.status as string) >= i
                  const isCancelled = order.status === 'CANCELLED'
                  
                  return (
                    <div
                      key={status}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        isCancelled 
                          ? 'bg-red-300' 
                          : isActive 
                            ? 'bg-uss-primary' 
                            : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>

              {/* Quick Status Actions */}
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusInfo.nextStatus && (
                    <button
                      onClick={() => handleUpdateStatus(statusInfo.nextStatus!)}
                      disabled={updating}
                      className="flex items-center gap-2 px-3 py-2 bg-uss-primary text-white rounded-lg text-sm font-medium hover:bg-uss-primary-hover transition-colors disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                      Avançar para {statusConfig[statusInfo.nextStatus].label}
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Payment Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl border-2 p-5 ${paymentInfo.bgColor} border-gray-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Status do Pagamento</h3>
                <PaymentIcon className={`w-6 h-6 ${paymentInfo.color}`} />
              </div>
              <p className={`text-2xl font-bold ${paymentInfo.color}`}>{paymentInfo.label}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {order.paymentMethod || 'Cartão de Crédito'}
                  </span>
                </div>
                {order.installments && order.installments > 1 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Parcelas:</span>
                    <span className="font-medium">{order.installments}x de {formatCurrency(order.total / order.installments)}</span>
                  </div>
                )}
              </div>

              {order.paymentStatus === 'PAID' && order.status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors w-full justify-center"
                >
                  <Undo2 className="w-4 h-4" />
                  Processar Reembolso
                </button>
              )}
            </motion.div>
          </div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-uss-primary" />
                Itens do Pedido ({order.items?.length || order.orderItems?.length || 0})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {(order.items || order.orderItems || []).map((item: any, i: number) => {
                const product = item.product || {}
                const images = product.images ? (typeof product.images === 'string' ? product.images.split(',') : product.images) : []
                
                return (
                  <div key={i} className="p-5 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {images[0] ? (
                        <img 
                          src={images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold truncate">{product.name || 'Produto'}</p>
                      <p className="text-gray-500 text-sm">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      {product.sku && (
                        <p className="text-gray-400 text-xs mt-1">SKU: {product.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frete</span>
                <span className="text-gray-900">{order.shipping === 0 ? 'Grátis' : formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto</span>
                  <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-uss-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Stripe Integration Info */}
          {order.stripePaymentIntentId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-violet-600" />
                  Dados do Stripe
                </h3>
                <a
                  href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-800 text-sm font-medium"
                >
                  Ver no Stripe
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Intent ID</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-white px-2 py-1 rounded font-mono text-violet-700">
                      {order.stripePaymentIntentId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.stripePaymentIntentId!, 'Payment Intent ID')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {order.stripeCustomerId && (
                  <div>
                    <p className="text-sm text-gray-600">Customer ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-white px-2 py-1 rounded font-mono text-violet-700">
                        {order.stripeCustomerId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(order.stripeCustomerId!, 'Customer ID')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-uss-primary/5 to-uss-accent/5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-uss-primary" />
                Cliente
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xl font-bold text-gray-900">{order.user?.name || 'Cliente'}</p>
                <p className="text-sm text-gray-500">ID: {order.userId}</p>
              </div>
              
              {order.user?.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 truncate">{order.user.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.user!.email!, 'Email')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {(order.user as any)?.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="text-gray-900">{(order.user as any).phone}</p>
                  </div>
                  <a
                    href={`https://wa.me/55${(order.user as any).phone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => sendOrderNotification(order.status)}
                  disabled={sendingNotification}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-uss-primary text-white rounded-lg text-sm font-medium hover:bg-uss-primary-hover transition-colors disabled:opacity-50"
                >
                  {sendingNotification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Notificar
                </button>
                <a
                  href={`https://wa.me/55${(order.user as any)?.phone?.replace(/\D/g, '') || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-uss-primary" />
                Endereço de Entrega
              </h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-700 leading-relaxed">{parseAddress(order.shippingAddress)}</p>
              
              {order.trackingCode && (
                <div className="mt-4 p-4 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-600 font-medium mb-1">Código de Rastreio</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono text-violet-800">{order.trackingCode}</code>
                    <button
                      onClick={() => copyToClipboard(order.trackingCode!, 'Código de rastreio')}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:text-violet-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium mb-1">Previsão de Entrega</p>
                  <p className="text-blue-800 font-semibold">{formatDate(order.estimatedDelivery)}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-uss-primary" />
                Histórico
              </h3>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-uss-primary rounded-full mt-1.5" />
                  <div>
                    <p className="text-gray-900 font-medium">Pedido criado</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-1.5" />
                    <div>
                      <p className="text-gray-900 font-medium">Última atualização</p>
                      <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5" />
                    <div>
                      <p className="text-gray-900 font-medium">Entregue</p>
                      <p className="text-sm text-gray-500">{formatDate(order.deliveredAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* All Status Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-uss-primary" />
                Alterar Status
              </h3>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const isActive = order.status === status
                const Icon = config.icon
                
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status as OrderStatus)}
                    disabled={updating || isActive}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? `${config.bgColor} ${config.color} border-2 ${config.borderColor}`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                    } disabled:opacity-50`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                    {isActive && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar Reembolso</h3>
                <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Você está prestes a reembolsar <strong>{formatCurrency(order.total)}</strong> para o cliente.
              {order.stripePaymentIntentId && (
                <span className="block text-sm text-violet-600 mt-1">
                  💳 O reembolso será processado no Stripe automaticamente.
                </span>
              )}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do reembolso (opcional - deixe vazio para reembolso total)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={refundAmount || ''}
                  onChange={(e) => setRefundAmount(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder={order.total.toFixed(2)}
                  max={order.total}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do reembolso
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Descreva o motivo do reembolso..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setRefundReason('')
                  setRefundAmount(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRefund}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Undo2 className="w-4 h-4" />
                )}
                Confirmar Reembolso
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
