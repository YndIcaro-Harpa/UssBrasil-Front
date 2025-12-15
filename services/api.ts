/**
 * API Service - USS Brasil E-commerce
 * Serviço centralizado para comunicação com o backend NestJS
 */

import { BACKEND_URL } from '@/lib/config'

const API_URL = BACKEND_URL

// ============================================
// TYPES
// ============================================

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  image?: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
    variations: number
  }
}

export interface Variation {
  id: string
  productId: string
  name: string
  sku: string
  ncm?: string
  colorName?: string
  colorCode?: string
  colorImage?: string
  colorImages?: string
  storage?: string
  size?: string
  costPrice?: number
  price: number
  discountPrice?: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isActive: boolean
  condition: 'new' | 'semi_new' | 'used'
  image?: string
  supplierId?: string
  supplierName?: string
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
    slug: string
  }
  supplier?: Supplier
}

export interface Coupon {
  id: string
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minAmount?: number
  maxAmount?: number
  usageLimit?: number
  usageCount: number
  userLimit?: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CMSPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductVariation {
  id: string
  name: string
  sku: string
  ncm: string
  image: string
  stock: number
  priceAdjustment: number
  serialNumbers: string[]
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  stock: number
  images: string
  featured: boolean
  specifications?: string
  weight?: number
  dimensions?: string
  warranty?: number
  tags?: string
  isActive: boolean
  categoryId: string
  brandId: string
  category?: Category
  brand?: Brand
  createdAt: string
  updatedAt: string
  // Campos de precificação
  sku?: string
  ncm?: string
  costPrice?: number
  suggestedPrice?: number
  originalPrice?: number
  discountPercent?: number
  stripeDiscount?: number
  stripeFinalPrice?: number
  finalPrice?: number
  markup?: number
  profitMargin?: number
  profitValue?: number
  isPreOrder?: boolean
  // Variações de produto
  productVariations?: ProductVariation[]
  hasVariations?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  image?: string
  isActive: boolean
  sortOrder: number
  brandId?: string
  brand?: Brand
  _count?: { products: number }
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  color?: string
  website?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  _count?: { products: number }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  subtotal?: number
  selectedColor?: string
  selectedColorCode?: string
  selectedStorage?: string
  selectedSize?: string
  variationId?: string
  productName?: string
  productSku?: string
  productImage?: string
  product?: Product
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: string
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: any
  trackingCode?: string
  notes?: string
  estimatedDelivery?: string
  deliveredAt?: string
  items: OrderItem[]
  orderItems?: OrderItem[]
  user?: User
  createdAt: string
  updatedAt: string
  // Stripe fields
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  installments?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || `Erro ${response.status}`)
  }
  return response.json()
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<{ access_token: string; user: User }>(response)
  },

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<{ access_token: string; user: User }>(response)
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders(token),
    })
    return handleResponse<User>(response)
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// USERS API
// ============================================

export interface CustomerStats {
  id: string
  name: string
  email: string
  phone: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  status: 'active' | 'inactive'
  totalOrders: number
  totalSpent: number
  lastOrder: string | null
  registeredAt: string
  location: {
    city: string
    state: string
  }
  loyaltyPoints: number
  averageRating: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  usersWithOrders: number
  conversionRate: number | string
  totalRevenue: number
  averageRevenuePerUser: number
}

export const usersApi = {
  async getAll(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const response = await fetch(`${API_URL}/users?${queryParams}`)
    return handleResponse<PaginatedResponse<User>>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/users/${id}`)
    return handleResponse<User>(response)
  },

  async getStats() {
    const response = await fetch(`${API_URL}/users/stats`)
    return handleResponse<UserStats>(response)
  },

  async getCustomers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    
    const response = await fetch(`${API_URL}/users/customers?${queryParams}`)
    return handleResponse<{ customers: CustomerStats[]; pagination: { page: number; limit: number; total: number; pages: number } }>(response)
  },

  async getUserOrders(id: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const response = await fetch(`${API_URL}/users/${id}/orders?${queryParams}`)
    return handleResponse<{ orders: Order[]; totalSpent: number; pagination: { page: number; limit: number; total: number; pages: number } }>(response)
  },

  async update(id: string, data: Partial<User>, token?: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<User>(response)
  },

  async create(data: {
    name: string
    email: string
    password: string
    phone?: string
    cpf?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    role?: 'USER' | 'ADMIN'
  }, token?: string) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<User>(response)
  },

  async changePassword(id: string, newPassword: string, token?: string) {
    const response = await fetch(`${API_URL}/users/${id}/password`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ newPassword }),
    })
    return handleResponse<{ message: string }>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  async getAll(params?: {
    page?: number
    limit?: number
    categoryId?: string
    brandId?: string
    featured?: boolean
    search?: string
    status?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params?.brandId) queryParams.append('brandId', params.brandId)
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    
    const response = await fetch(`${API_URL}/products?${queryParams}`)
    const result = await handleResponse<{ products: Product[]; pagination: { total: number; page: number; pages: number; limit: number } }>(response)
    
    // Normaliza para o formato esperado pelo frontend
    return {
      data: result.products || [],
      total: result.pagination?.total || 0,
      page: result.pagination?.page || 1,
      totalPages: result.pagination?.pages || 1,
      limit: result.pagination?.limit || params?.limit || 10
    }
  },

  async getFeatured(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_URL}/products/featured${queryParams}`)
    return handleResponse<Product[]>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/products/${id}`)
    return handleResponse<Product>(response)
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_URL}/products/slug/${slug}`)
    return handleResponse<Product>(response)
  },

  async getRelated(id: string, limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_URL}/products/${id}/related${queryParams}`)
    return handleResponse<Product[]>(response)
  },

  async create(data: Partial<Product>, token?: string) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Product>(response)
  },

  async update(id: string, data: Partial<Product>, token?: string) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Product>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  async uploadImages(id: string, files: File[], token?: string) {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    
    const response = await fetch(`${API_URL}/products/${id}/images`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return handleResponse<Product>(response)
  },

  async getStats() {
    const response = await fetch(`${API_URL}/products/stats`)
    return handleResponse<{
      totalProducts: number
      activeProducts: number
      totalStockUnits: number
      totalStockValue: number
      lowStockCount: number
      outOfStockCount: number
      featuredCount: number
    }>(response)
  },

  async getLowStock(threshold: number = 5, limit: number = 10) {
    const response = await fetch(`${API_URL}/products/low-stock?threshold=${threshold}&limit=${limit}`)
    return handleResponse<Product[]>(response)
  },
}

// ============================================
// CATEGORIES API
// ============================================

export const categoriesApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/categories`)
    return handleResponse<Category[]>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/categories/${id}`)
    return handleResponse<Category>(response)
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_URL}/categories/slug/${slug}`)
    return handleResponse<Category>(response)
  },

  async create(data: Partial<Category>, token?: string) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Category>(response)
  },

  async update(id: string, data: Partial<Category>, token?: string) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Category>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  async seed(token?: string) {
    const response = await fetch(`${API_URL}/categories/seed`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// BRANDS API
// ============================================

export const brandsApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/brands`)
    return handleResponse<Brand[]>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/brands/${id}`)
    return handleResponse<Brand>(response)
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_URL}/brands/slug/${slug}`)
    return handleResponse<Brand>(response)
  },

  async create(data: Partial<Brand>, token?: string) {
    const response = await fetch(`${API_URL}/brands`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Brand>(response)
  },

  async update(id: string, data: Partial<Brand>, token?: string) {
    const response = await fetch(`${API_URL}/brands/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Brand>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/brands/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  async seed(token?: string) {
    const response = await fetch(`${API_URL}/brands/seed`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// SUPPLIERS API
// ============================================

export const suppliersApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/suppliers`)
    return handleResponse<Supplier[]>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/suppliers/${id}`)
    return handleResponse<Supplier>(response)
  },

  async create(data: Partial<Supplier>, token?: string) {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Supplier>(response)
  },

  async update(id: string, data: Partial<Supplier>, token?: string) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Supplier>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// VARIATIONS API
// ============================================

export const variationsApi = {
  async getAll(params?: {
    productId?: string
    supplierId?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params?.productId) queryParams.append('productId', params.productId)
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const response = await fetch(`${API_URL}/variations?${queryParams}`)
    return handleResponse<Variation[]>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/variations/${id}`)
    return handleResponse<Variation>(response)
  },

  async getByProduct(productId: string) {
    const response = await fetch(`${API_URL}/variations?productId=${productId}`)
    return handleResponse<Variation[]>(response)
  },

  async create(data: Partial<Variation>, token?: string) {
    const response = await fetch(`${API_URL}/variations`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Variation>(response)
  },

  async update(id: string, data: Partial<Variation>, token?: string) {
    const response = await fetch(`${API_URL}/variations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Variation>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/variations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  async updateStock(id: string, stock: number, token?: string) {
    const response = await fetch(`${API_URL}/variations/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ stock }),
    })
    return handleResponse<Variation>(response)
  },
}

// ============================================
// COUPONS API
// ============================================

export const couponsApi = {
  async getAll(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    
    const response = await fetch(`${API_URL}/coupons?${queryParams}`)
    return handleResponse<{ coupons: Coupon[]; pagination: { page: number; limit: number; total: number; pages: number } }>(response)
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/coupons/${id}`)
    return handleResponse<Coupon>(response)
  },

  async getByCode(code: string) {
    const response = await fetch(`${API_URL}/coupons/code/${code}`)
    return handleResponse<Coupon>(response)
  },

  async validate(code: string, amount: number) {
    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount }),
    })
    return handleResponse<{ valid: boolean; coupon?: Coupon; discount?: number; message?: string }>(response)
  },

  async create(data: Partial<Coupon>, token?: string) {
    const response = await fetch(`${API_URL}/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Coupon>(response)
  },

  async update(id: string, data: Partial<Coupon>, token?: string) {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Coupon>(response)
  },

  async delete(id: string, token?: string) {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  async apply(code: string, orderId: string, token?: string) {
    const response = await fetch(`${API_URL}/coupons/apply`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ code, orderId }),
    })
    return handleResponse<{ success: boolean; discount: number; message: string }>(response)
  },
}

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    userId?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.userId) queryParams.append('userId', params.userId)
    
    const response = await fetch(`${API_URL}/orders?${queryParams}`)
    const result = await handleResponse<{ orders: Order[]; pagination: { total: number; page: number; pages: number } }>(response)
    
    // Normaliza para o formato esperado pelo frontend
    const normalizedOrders = (result.orders || []).map(order => ({
      ...order,
      // Garantir que items sempre existe (API retorna orderItems)
      items: order.items || order.orderItems || []
    }));
    
    return {
      data: normalizedOrders,
      total: result.pagination?.total || 0,
      page: result.pagination?.page || 1,
      totalPages: result.pagination?.pages || 1,
      limit: params?.limit || 10
    }
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/orders/${id}`)
    return handleResponse<Order>(response)
  },

  async getByUser(userId: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const response = await fetch(`${API_URL}/orders/user/${userId}?${queryParams}`)
    return handleResponse<PaginatedResponse<Order>>(response)
  },

  async getRecent(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_URL}/orders/recent${queryParams}`)
    return handleResponse<Order[]>(response)
  },

  async getStats() {
    const response = await fetch(`${API_URL}/orders/stats`)
    return handleResponse<{
      totalOrders: number
      totalRevenue: number
      ordersByStatus: Record<string, number>
    }>(response)
  },

  async create(data: {
    userId: string
    items: Array<{ productId: string; quantity: number; price: number }>
    shippingAddress: any
    paymentMethod: string
    subtotal: number
    shipping: number
    discount?: number
  }) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Order>(response)
  },

  async update(id: string, data: Partial<Order>, token?: string) {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<Order>(response)
  },

  async updateStatus(id: string, status: Order['status'], token?: string) {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    })
    return handleResponse<Order>(response)
  },

  async updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus'], token?: string) {
    const response = await fetch(`${API_URL}/orders/${id}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ paymentStatus }),
    })
    return handleResponse<Order>(response)
  },
}

// ============================================
// STRIPE API
// ============================================

export const stripeApi = {
  async createPaymentIntent(data: {
    amount: number
    currency?: string
    orderId?: string
    customerId?: string
    installments?: number
    customerEmail?: string
    items?: any[]
  }) {
    const response = await fetch(`${API_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<{
      clientSecret: string
      paymentIntentId: string
      amount: number
      originalAmount: number
      currency: string
      installments: number
      installmentOptions: any[]
    }>(response)
  },

  async createCustomer(data: { email: string; name?: string; userId?: string }) {
    const response = await fetch(`${API_URL}/stripe/create-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<{ customerId: string; email: string; name: string }>(response)
  },

  async cancelPaymentIntent(paymentIntentId: string) {
    const response = await fetch(`${API_URL}/stripe/cancel-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId }),
    })
    return handleResponse<{ paymentIntentId: string; status: string; message: string }>(response)
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    const response = await fetch(`${API_URL}/stripe/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    })
    return handleResponse<{
      paymentIntentId: string
      status: string
      amount: number
      currency: string
      message: string
    }>(response)
  },

  async processTestPayment(data: {
    amount: number
    currency?: string
    installments?: number
    customerEmail?: string
    userId?: string
    items?: Array<{ productId: string; quantity: number; price: number }>
    token?: string
  }) {
    const response = await fetch(`${API_URL}/stripe/test-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<{
      success: boolean
      paymentIntent: {
        id: string
        status: string
        amount: number
        currency: string
        description: string
      }
      paymentMethod: {
        id: string
        type: string
        card: {
          brand: string
          last4: string
          exp_month: number
          exp_year: number
        } | null
      }
      order: {
        id: string
        total: number
        status: string
        paymentStatus: string
        items: number
      } | null
      message: string
    }>(response)
  },

  async getPaymentStatus(paymentIntentId: string) {
    const response = await fetch(`${API_URL}/stripe/payment-status?id=${paymentIntentId}`)
    return handleResponse<{
      id: string
      status: string
      amount: number
      currency: string
      description: string
      metadata: Record<string, string>
      created: string
    }>(response)
  },

  async listPayments(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_URL}/stripe/payments${queryParams}`)
    return handleResponse<{
      total: number
      payments: Array<{
        id: string
        status: string
        amount: number
        currency: string
        description: string
        created: string
      }>
    }>(response)
  },

  async getInstallmentOptions(amount: number) {
    const response = await fetch(`${API_URL}/stripe/installment-options?amount=${amount}`)
    return handleResponse<{
      amount: number
      options: Array<{
        installments: number
        installmentValue: number
        totalValue: number
        interestRate: number
        hasInterest: boolean
      }>
    }>(response)
  },

  async createRefund(data: {
    paymentIntentId: string
    amount?: number
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  }) {
    const response = await fetch(`${API_URL}/stripe/create-refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<{
      refundId: string
      amount: number
      currency: string
      status: string
      message: string
    }>(response)
  },
}

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  // Obter análise de vendas
  getSales: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const queryString = params.toString()
    const response = await fetch(`${API_URL}/analytics/sales${queryString ? `?${queryString}` : ''}`)
    return handleResponse<{
      totalRevenue: number
      totalOrders: number
      averageOrderValue: number
      totalProducts: number
      revenueGrowth: number
      salesByDay: Array<{ date: string; revenue: number; orders: number }>
      salesByStatus: Array<{ status: string; count: number; revenue: number }>
      period: { start: string; end: string }
    }>(response)
  },

  // Obter produtos mais vendidos
  getTopProducts: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_URL}/analytics/products/top${params}`)
    return handleResponse<Array<{
      id: string
      name: string
      image: string
      category: string
      brand: string
      totalSold: number
      totalOrders: number
      revenue: number
    }>>(response)
  },

  // Obter análise de tráfego
  getTraffic: async () => {
    const response = await fetch(`${API_URL}/analytics/traffic`)
    return handleResponse<{
      totalVisits: number
      uniqueVisitors: number
      newUsersThisMonth: number
      totalOrders: number
      ordersThisMonth: number
      conversionRate: number
      bounceRate: number
      avgSessionDuration: number
      pageViews: number
      trafficSources: Array<{ source: string; visits: number; percentage: number }>
      deviceStats: Array<{ device: string; visits: number; percentage: number }>
    }>(response)
  },

  // Obter resumo do dashboard
  getDashboard: async () => {
    const response = await fetch(`${API_URL}/analytics/dashboard`)
    return handleResponse<{
      revenue: {
        total: number
        thisMonth: number
        lastMonth: number
        growth: number
      }
      orders: {
        total: number
        thisMonth: number
        lastMonth: number
        pending: number
      }
      users: {
        total: number
        newThisMonth: number
      }
      products: {
        total: number
        lowStock: number
      }
    }>(response)
  },
}

// ============================================
// CART API
// ============================================

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    originalPrice?: number | null
    discountPrice?: number | null
    images: string // String com URLs separadas por vírgula ou JSON
    category: {
      id: string
      name: string
      slug: string
    } | null
    brand: {
      id: string
      name: string
      slug: string
    } | null
    stock: number
  }
}

export interface CartResponse {
  items: CartItem[]
  totalItems: number
  subtotal: number
}

const cartApi = {
  // Buscar carrinho do usuário
  getCart: async (token: string): Promise<CartResponse> => {
    const response = await fetch(`${API_URL}/cart`, {
      headers: getAuthHeaders(token),
    })
    return handleResponse<CartResponse>(response)
  },

  // Adicionar item ao carrinho
  addToCart: async (token: string, productId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantity }),
    })
    return handleResponse<CartItem>(response)
  },

  // Atualizar quantidade de um item
  updateQuantity: async (token: string, productId: string, quantity: number): Promise<CartItem> => {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ quantity }),
    })
    return handleResponse<CartItem>(response)
  },

  // Remover item do carrinho
  removeFromCart: async (token: string, productId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  // Limpar carrinho
  clearCart: async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  // Sincronizar carrinho local com o banco
  syncCart: async (token: string, items: Array<{ productId: string; quantity: number }>): Promise<CartResponse> => {
    const response = await fetch(`${API_URL}/cart/sync`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ items }),
    })
    return handleResponse<CartResponse>(response)
  },
}

// ============================================
// WISHLIST API
// ============================================

export interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    originalPrice?: number | null
    images: string // String JSON com array de imagens
    category: {
      id: string
      name: string
      slug: string
    } | null
    brand: {
      id: string
      name: string
      slug: string
    } | null
    stock: number
    status: string
  }
  createdAt: string
}

export interface WishlistResponse {
  items: WishlistItem[]
  totalItems: number
}

const wishlistApi = {
  // Buscar wishlist do usuário
  getWishlist: async (token: string): Promise<WishlistResponse> => {
    const response = await fetch(`${API_URL}/wishlist`, {
      headers: getAuthHeaders(token),
    })
    return handleResponse<WishlistResponse>(response)
  },

  // Adicionar item à wishlist
  addToWishlist: async (token: string, productId: string): Promise<WishlistItem> => {
    const response = await fetch(`${API_URL}/wishlist/add`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId }),
    })
    return handleResponse<WishlistItem>(response)
  },

  // Verificar se produto está na wishlist
  checkInWishlist: async (token: string, productId: string): Promise<{ inWishlist: boolean }> => {
    const response = await fetch(`${API_URL}/wishlist/check/${productId}`, {
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ inWishlist: boolean }>(response)
  },

  // Remover item da wishlist
  removeFromWishlist: async (token: string, productId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  // Limpar wishlist
  clearWishlist: async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/wishlist`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },

  // Sincronizar wishlist local com o banco
  syncWishlist: async (token: string, productIds: string[]): Promise<WishlistResponse> => {
    const response = await fetch(`${API_URL}/wishlist/sync`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productIds }),
    })
    return handleResponse<WishlistResponse>(response)
  },

  // Mover item da wishlist para o carrinho
  moveToCart: async (token: string, productId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/wishlist/move-to-cart/${productId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// CMS API - Páginas Estáticas
// ============================================

const cmsApi = {
  // Listar todas as páginas
  getAll: async (): Promise<{ pages: CMSPage[] }> => {
    try {
      const response = await fetch(`${API_URL}/cms/pages`, {
        headers: getHeaders(),
      })
      return handleResponse<{ pages: CMSPage[] }>(response)
    } catch {
      // Fallback para páginas do sistema se endpoint não existir
      return { pages: [] }
    }
  },

  // Buscar página por ID
  getById: async (id: string): Promise<CMSPage> => {
    const response = await fetch(`${API_URL}/cms/pages/${id}`, {
      headers: getHeaders(),
    })
    return handleResponse<CMSPage>(response)
  },

  // Buscar página por slug
  getBySlug: async (slug: string): Promise<CMSPage> => {
    const response = await fetch(`${API_URL}/cms/pages/slug/${slug}`, {
      headers: getHeaders(),
    })
    return handleResponse<CMSPage>(response)
  },

  // Criar nova página
  create: async (data: Partial<CMSPage>, token?: string): Promise<CMSPage> => {
    const response = await fetch(`${API_URL}/cms/pages`, {
      method: 'POST',
      headers: token ? getAuthHeaders(token) : getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<CMSPage>(response)
  },

  // Atualizar página
  update: async (id: string, data: Partial<CMSPage>, token?: string): Promise<CMSPage> => {
    const response = await fetch(`${API_URL}/cms/pages/${id}`, {
      method: 'PATCH',
      headers: token ? getAuthHeaders(token) : getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<CMSPage>(response)
  },

  // Deletar página
  delete: async (id: string, token?: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/cms/pages/${id}`, {
      method: 'DELETE',
      headers: token ? getAuthHeaders(token) : getHeaders(),
    })
    return handleResponse<{ message: string }>(response)
  },
}

// ============================================
// SETTINGS API
// ============================================

export interface SiteConfigItem {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

const settingsApi = {
  // Buscar todas as configurações (formato key-value)
  getAll: async (): Promise<Record<string, string>> => {
    try {
      const response = await fetch(`${API_URL}/site-config`, {
        headers: getHeaders(),
      })
      return handleResponse<Record<string, string>>(response)
    } catch {
      return {}
    }
  },

  // Buscar configurações (formato raw para admin)
  getAllAdmin: async (token?: string): Promise<SiteConfigItem[]> => {
    try {
      const response = await fetch(`${API_URL}/site-config/admin`, {
        headers: token ? getAuthHeaders(token) : getHeaders(),
      })
      return handleResponse<SiteConfigItem[]>(response)
    } catch {
      return []
    }
  },

  // Atualizar uma configuração
  update: async (key: string, value: string, token?: string): Promise<SiteConfigItem> => {
    const response = await fetch(`${API_URL}/site-config/${key}`, {
      method: 'PUT',
      headers: token ? getAuthHeaders(token) : getHeaders(),
      body: JSON.stringify({ value }),
    })
    return handleResponse<SiteConfigItem>(response)
  },

  // Atualizar várias configurações de uma vez
  updateMany: async (configs: { key: string; value: string }[], token?: string): Promise<SiteConfigItem[]> => {
    const response = await fetch(`${API_URL}/site-config`, {
      method: 'PUT',
      headers: token ? getAuthHeaders(token) : getHeaders(),
      body: JSON.stringify({ configs }),
    })
    return handleResponse<SiteConfigItem[]>(response)
  },
}

// ============================================
// EXPORT ALL
// ============================================

export const api = {
  auth: authApi,
  users: usersApi,
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  suppliers: suppliersApi,
  variations: variationsApi,
  coupons: couponsApi,
  orders: ordersApi,
  stripe: stripeApi,
  analytics: analyticsApi,
  cart: cartApi,
  wishlist: wishlistApi,
  cms: cmsApi,
  settings: settingsApi,
}

export default api
