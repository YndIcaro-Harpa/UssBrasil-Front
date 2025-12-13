// API client integrado com backend NestJS - USS Brasil
import { BACKEND_URL } from './config'

// Interfaces
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  brand: {
    id: string
    name: string
    slug: string
  }
  stock: number
  featured: boolean
  specifications?: Record<string, any>
  tags?: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  featured: boolean
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  featured: boolean
  color?: string
  website?: string
  _count?: { products: number }
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

// Interface para dados de pedido
export interface OrderData {
  items: Array<{
    productId: string
    variationId?: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: string
  total: number
  subtotal: number
  shippingCost: number
  discount?: number
  couponCode?: string
}

// Interface para produto cru da API
interface RawProduct {
  id: string | number
  name?: string
  slug?: string
  description?: string
  price?: number
  discountPrice?: number
  images?: string | string[]
  image?: string
  category?: string | { id: string; name: string; slug: string }
  categoryId?: string
  brand?: string | { id: string; name: string; slug: string }
  brandId?: string
  stock?: number
  featured?: boolean
  specifications?: string | Record<string, unknown>
  tags?: string | string[]
  status?: string
  createdAt?: string
  updatedAt?: string
}

// API Client class
class ApiClient {
  private baseUrl: string
  private requestQueue: Promise<any>[] = []
  private requestTimes: number[] = []
  private maxRequestsPerSecond = 5
  private lastError: string | null = null

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl
  }

  // Rate limiting
  private async checkRateLimit() {
    const now = Date.now()
    // Remove requests older than 1 second
    this.requestTimes = this.requestTimes.filter(time => now - time < 1000)
    
    if (this.requestTimes.length >= this.maxRequestsPerSecond) {
      const waitTime = 1000 - (now - this.requestTimes[0])
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.requestTimes.push(now)
  }

  // Retry logic com backoff exponencial e timeout
  private async fetchWithRetry(endpoint: string, options: RequestInit = {}, retries = 3) {
    let lastError: Error | null = null
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.checkRateLimit()
        
        const url = `${this.baseUrl}${endpoint}`
        console.log(`[API] Requesting: ${url}`)
        
        // Adicionar timeout de 30 segundos
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
          ...options,
        })

        clearTimeout(timeoutId)

        if (response.status === 429) {
          // Too Many Requests - aguardar mais tempo
          const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000
          console.warn(`[API] Rate limited. Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details')
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log(`[API] Success: ${url}`)
        return data
      } catch (error: unknown) {
        const err = error as Error
        lastError = err
        
        // Mensagem de erro mais clara
        if (err.name === 'AbortError') {
          console.error(`[API] Timeout: ${this.baseUrl}${endpoint}`)
          lastError = new Error(`Timeout: O servidor não respondeu em 30 segundos. Verifique se ${this.baseUrl} está acessível.`)
        } else if (err.message.includes('fetch')) {
          console.error(`[API] Network error: ${err.message}`)
          lastError = new Error(`Erro de rede: Não foi possível conectar ao backend em ${this.baseUrl}. Verifique sua conexão.`)
        }
        
        if (i < retries - 1) {
          const waitTime = Math.pow(2, i) * 500
          console.warn(`[API] Retry ${i + 1}/${retries - 1} after ${waitTime}ms - ${err.message}`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    this.lastError = lastError?.message || 'Unknown error'
    console.error(`[API] Failed after ${retries} retries:`, lastError?.message)
    throw lastError
  }

  // Generic methods
  async get(endpoint: string, options: RequestInit = {}) {
    const data = await this.fetchWithRetry(endpoint, { ...options, method: 'GET' })
    return { data }
  }

  async post(endpoint: string, body: any, options: RequestInit = {}) {
    const data = await this.fetchWithRetry(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
    return { data }
  }

  async put(endpoint: string, body: any, options: RequestInit = {}) {
    const data = await this.fetchWithRetry(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return { data }
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    const data = await this.fetchWithRetry(endpoint, { ...options, method: 'DELETE' })
    return { data }
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    return this.fetchWithRetry(endpoint, options)
  }

  // Products
  async getProducts(filters: ProductFilters = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })
    
    const endpoint = `/products?${queryParams.toString()}`
    const response = await this.fetchApi(endpoint)
    const products = Array.isArray(response) ? response : (response?.products || [])
    return products.map(normalizeProduct)
  }

  async getProductById(id: string) {
    return this.fetchApi(`/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.fetchApi(`/products/slug/${slug}`)
  }

  async getFeaturedProducts() {
    const response = await this.fetchApi('/products/featured')
    const products = Array.isArray(response) ? response : (response?.products || [])
    return products.map(normalizeProduct)
  }

  async getRelatedProducts(id: string) {
    const response = await this.fetchApi(`/products/${id}/related`)
    const products = Array.isArray(response) ? response : (response?.products || [])
    return products.map(normalizeProduct)
  }

  // Categories
  async getCategories() {
    const response = await this.fetchApi('/categories')
    // backend may return array or { data: [...] } or { categories: [...] }
    const categories = Array.isArray(response) ? response : (response?.data || response?.categories || [])
    return categories
  }

  async getCategoryById(id: string) {
    return this.fetchApi(`/categories/${id}`)
  }

  async getCategoryBySlug(slug: string) {
    return this.fetchApi(`/categories/slug/${slug}`)
  }

  // Brands
  async getBrands() {
    const response = await this.fetchApi('/brands')
    const brands = Array.isArray(response) ? response : (response?.data || response?.brands || [])
    return brands
  }

  async getBrandById(id: string) {
    return this.fetchApi(`/brands/${id}`)
  }

  async getBrandBySlug(slug: string) {
    return this.fetchApi(`/brands/slug/${slug}`)
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string 
  }) {
    return this.fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile(token: string) {
    return this.fetchApi('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Orders
  async createOrder(orderData: OrderData, token: string) {
    return this.fetchApi('/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })
  }

  async getUserOrders(token: string) {
    return this.fetchApi('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getOrderById(id: string, token: string) {
    return this.fetchApi(`/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

// Instância singleton
const apiClient = new ApiClient()

// Exports
export default apiClient
export { apiClient }

// Utility functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export const calculateDiscount = (price: number, discountPrice?: number): number => {
  if (!discountPrice) return 0
  return Math.round(((price - discountPrice) / price) * 100)
}

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Normaliza produtos vindos da API para o formato do frontend
function normalizeProduct(raw: RawProduct): Product {
  // Normalizar imagens - pode ser string, array, ou undefined
  const imagesRaw = raw.images ?? raw.image ?? ''
  let images: string[] = []
  
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw
      .map((s: string) => {
        const str = String(s || '').trim()
        return str || undefined
      })
      .filter((s): s is string => Boolean(s))
  } else if (typeof imagesRaw === 'string' && imagesRaw.trim()) {
    // Suporta múltiplos formatos: vírgula separada, espaço, etc
    images = imagesRaw
      .split(/[,;|]+/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  const tagsRaw = raw.tags ?? ''
  const tags: string[] = Array.isArray(tagsRaw)
    ? tagsRaw.map((t: string) => (t || '').trim()).filter(Boolean)
    : (typeof tagsRaw === 'string' ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [])

  let specifications: Record<string, unknown> | undefined = undefined
  if (raw.specifications) {
    if (typeof raw.specifications === 'string') {
      try {
        specifications = JSON.parse(raw.specifications)
      } catch (e) {
        specifications = { raw: raw.specifications }
      }
    } else if (typeof raw.specifications === 'object') {
      specifications = raw.specifications
    }
  }

  // Normalizar category
  let categoryObj: { id: string; name: string; slug: string }
  if (typeof raw.category === 'object' && raw.category !== null) {
    categoryObj = {
      id: raw.category.id || raw.categoryId || '',
      name: raw.category.name || 'Geral',
      slug: raw.category.slug || ''
    }
  } else {
    categoryObj = {
      id: raw.categoryId || '',
      name: typeof raw.category === 'string' ? raw.category : 'Geral',
      slug: ''
    }
  }

  // Normalizar brand
  let brandObj: { id: string; name: string; slug: string }
  if (typeof raw.brand === 'object' && raw.brand !== null) {
    brandObj = {
      id: raw.brand.id || raw.brandId || '',
      name: raw.brand.name || 'Marca',
      slug: raw.brand.slug || ''
    }
  } else {
    brandObj = {
      id: raw.brandId || '',
      name: typeof raw.brand === 'string' ? raw.brand : 'Marca',
      slug: ''
    }
  }

  const product: Product = {
    id: String(raw.id),
    name: raw.name || '',
    slug: raw.slug || String(raw.id) || '',
    description: raw.description || '',
    price: Number(raw.price || 0),
    discountPrice: raw.discountPrice !== undefined && raw.discountPrice !== null ? Number(raw.discountPrice) : undefined,
    images: images.length > 0 ? images : [],
    category: categoryObj,
    brand: brandObj,
    stock: Number(raw.stock || 0),
    featured: Boolean(raw.featured),
    specifications,
    tags,
    status: raw.status || 'ACTIVE',
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || ''
  }

  return product
}
