// API client integrado com backend NestJS - USS Brasil
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

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

// API Client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
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
    return this.fetchApi(endpoint)
  }

  async getProductById(id: string) {
    return this.fetchApi(`/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.fetchApi(`/products/slug/${slug}`)
  }

  async getFeaturedProducts() {
    return this.fetchApi('/products/featured')
  }

  async getRelatedProducts(id: string) {
    return this.fetchApi(`/products/${id}/related`)
  }

  // Categories
  async getCategories() {
    return this.fetchApi('/categories')
  }

  async getCategoryById(id: string) {
    return this.fetchApi(`/categories/${id}`)
  }

  async getCategoryBySlug(slug: string) {
    return this.fetchApi(`/categories/slug/${slug}`)
  }

  // Brands
  async getBrands() {
    return this.fetchApi('/brands')
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
  async createOrder(orderData: any, token: string) {
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
