// Re-exporta tipos unificados de produtos
export * from './product-unified';

// Alias para compatibilidade com código legado
export type { 
  Product,
  CartItem,
  FavoriteItem,
  ProductVariation,
  ProductBrand,
  ProductCategory,
  ProductSpecifications,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  ProductStats,
  ProductsListResponse,
} from './product-unified';

export interface VideoCategory {
  id: string
  name: string
  description?: string
  videoPath: string
  thumbnail?: string
}

export interface Brand {
  id: string
  name: string
  logo: string
  description?: string
  featured?: boolean
  productsCount?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  parent?: string
  featured?: boolean
  productsCount?: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isVip?: boolean
  joinedAt?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
  shipping: {
    address: string
    method: string
    cost: number
  }
  payment: {
    method: string
    status: 'pending' | 'paid' | 'failed'
  }
}

// Tipos para componentes específicos
export interface EnhancedProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onAddToFavorites?: (product: Product) => void
  className?: string
}

export interface SearchFilters {
  query: string
  category: string
  brand: string
  priceRange: [number, number]
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  inStock: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

// Tipos de eventos
export interface CartAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_QUANTITY' | 'CLEAR_CART'
  payload?: CartItem | { id: string; quantity?: number }
}

export interface FavoritesAction {
  type: 'ADD_FAVORITE' | 'REMOVE_FAVORITE' | 'CLEAR_FAVORITES'
  payload?: FavoriteItem | { id: string }
}

// Tipos de API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ProductsResponse extends ApiResponse<Product[]> {
  pagination?: PaginationInfo
}

// Tipos de configuração
export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
    instagram: string
    facebook: string
  }
}

export interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system'
  enableSystemTheme: boolean
}

// Tipos para analytics
export interface AnalyticsEvent {
  event: string
  properties: Record<string, string | number | boolean>
  timestamp: string
}

export interface ConversionEvent extends AnalyticsEvent {
  event: 'purchase' | 'add_to_cart' | 'view_product' | 'signup'
  value?: number
  currency?: string
}
