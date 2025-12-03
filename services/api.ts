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
  isActive: boolean
  _count?: { products: number }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
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
  }) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params?.brandId) queryParams.append('brandId', params.brandId)
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.search) queryParams.append('search', params.search)
    
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
    return {
      data: result.orders || [],
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
// EXPORT ALL
// ============================================

export const api = {
  auth: authApi,
  users: usersApi,
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  orders: ordersApi,
  stripe: stripeApi,
  analytics: analyticsApi,
}

export default api
