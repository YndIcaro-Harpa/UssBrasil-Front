/**
 * Configurações Centralizadas - USS Brasil E-commerce
 * Este arquivo contém todas as constantes e configurações do sistema
 */

// ============================================
// URLs e Endpoints
// ============================================

// URL do Backend - usar apenas esta variável em todo o projeto
// Em produção usa Render, em dev usa localhost ou .env
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://ussbrasil-back.onrender.com' 
    : 'http://localhost:3001')

// URLs de produção (Render)
export const PRODUCTION_BACKEND_URL = 'https://ussbrasil-back.onrender.com'

// URL atual baseada no ambiente
export const API_BASE_URL = BACKEND_URL

// ============================================
// Cores do Sistema - USS Brasil
// ============================================

export const colors = {
  // Cores primárias da marca
  primary: '#001941',        // Azul escuro principal
  primaryHover: '#023a58',   // Hover do primário
  primaryLight: '#034a6e',   // Versão mais clara
  
  // Cores de acentuação (Tailwind classes)
  accent: 'blue-400',        // Azul claro para acentos
  accentHex: '#60a5fa',      // Hex do blue-400
  
  // Status
  success: 'emerald-500',
  successHex: '#10b981',
  warning: 'amber-500',
  warningHex: '#f59e0b',
  error: 'red-500',
  errorHex: '#ef4444',
  info: 'blue-500',
  infoHex: '#3b82f6',
  
  // Backgrounds
  background: 'gray-50',
  backgroundHex: '#f9fafb',
  card: 'white',
  cardHex: '#ffffff',
  
  // Texto
  textPrimary: 'gray-900',
  textSecondary: 'gray-600',
  textMuted: 'gray-500',
}

// ============================================
// Configurações de Paginação
// ============================================

export const pagination = {
  defaultLimit: 12,
  adminLimit: 20,
  maxLimit: 100,
}

// ============================================
// Configurações de Rate Limiting
// ============================================

export const rateLimits = {
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
  },
  upload: {
    maxUploads: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
}

// ============================================
// Configurações de Upload
// ============================================

export const upload = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  cloudinaryFolder: 'uss-brasil',
}

// ============================================
// Configurações de Pagamento (Stripe)
// ============================================

export const payment = {
  maxInstallments: 12,
  minInstallmentValue: 50, // R$ 50,00
  currency: 'brl',
  installmentFeePercent: 2.99, // Taxa por parcela
}

// ============================================
// Configurações de Frete
// ============================================

export const shipping = {
  freeShippingMinValue: 299, // R$ 299,00
  defaultShippingCost: 19.90,
}

// ============================================
// WhatsApp
// ============================================

export const whatsapp = {
  number: '5548991832760',
  messageTemplate: (productName: string) => 
    `Olá! Tenho interesse no produto: ${productName}`,
}

// ============================================
// Regex e Validações
// ============================================

export const validations = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cpfClean: /^\d{11}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-?\d{3}$/,
  phone: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

// ============================================
// Meta Tags Default
// ============================================

export const metadata = {
  siteName: 'USS Brasil',
  siteUrl: 'https://ussbrasil.com.br',
  defaultTitle: 'USS Brasil - Eletrônicos Premium',
  defaultDescription: 'Loja oficial de eletrônicos premium. iPhone, Samsung, JBL e muito mais.',
  defaultImage: '/og-image.png',
}

// ============================================
// Status de Pedidos
// ============================================

export const orderStatus = {
  PENDING: { label: 'Pendente', color: 'yellow' },
  PROCESSING: { label: 'Processando', color: 'blue' },
  SHIPPED: { label: 'Enviado', color: 'purple' },
  DELIVERED: { label: 'Entregue', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
}

export const paymentStatus = {
  PENDING: { label: 'Aguardando', color: 'yellow' },
  PAID: { label: 'Pago', color: 'green' },
  FAILED: { label: 'Falhou', color: 'red' },
  REFUNDED: { label: 'Reembolsado', color: 'gray' },
}

// ============================================
// Helper Functions
// ============================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// ============================================
// API Endpoints
// ============================================

export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  refreshToken: '/auth/refresh',
  
  // Products
  products: '/products',
  productBySlug: (slug: string) => `/products/slug/${slug}`,
  productById: (id: string) => `/products/${id}`,
  featuredProducts: '/products/featured',
  
  // Categories
  categories: '/categories',
  categoryBySlug: (slug: string) => `/categories/slug/${slug}`,
  
  // Brands
  brands: '/brands',
  brandBySlug: (slug: string) => `/brands/slug/${slug}`,
  
  // Orders
  orders: '/orders',
  orderById: (id: string) => `/orders/${id}`,
  userOrders: (userId: string) => `/orders/user/${userId}`,
  
  // Upload
  uploadImage: '/upload/product-image',
  uploadMultiple: '/upload/images',
  
  // Stripe
  createPaymentIntent: '/stripe/create-payment-intent',
  installmentOptions: '/stripe/installment-options',
  
  // Coupons
  coupons: '/coupons',
  validateCoupon: '/coupons/validate',
  
  // Analytics
  analytics: '/analytics',
  analyticsSales: '/analytics/sales',
  analyticsProducts: '/analytics/products/top',
  analyticsDashboard: '/analytics/dashboard',
}

export default {
  BACKEND_URL,
  API_BASE_URL,
  colors,
  pagination,
  rateLimits,
  upload,
  payment,
  shipping,
  whatsapp,
  validations,
  metadata,
  orderStatus,
  paymentStatus,
  endpoints,
  formatCurrency,
  formatCPF,
  formatCEP,
  formatPhone,
}
