/**
 * Tipos Unificados de Produto - USS Brasil
 * 
 * Este arquivo contém todos os tipos relacionados a produtos
 * para garantir consistência em todo o projeto.
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Variação de Produto
 */
export interface ProductVariation {
  id: string;
  productId: string;
  name: string;
  sku: string;
  colorName?: string;
  colorCode?: string;
  colorImage?: string;
  storage?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  stock: number;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Marca do Produto
 */
export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  color?: string;
  isActive?: boolean;
}

/**
 * Categoria do Produto
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder?: number;
  brandId?: string;
  isActive?: boolean;
}

/**
 * Especificações do Produto
 */
export interface ProductSpecifications {
  processor?: string;
  storage?: string;
  ram?: string;
  display?: string;
  camera?: string;
  battery?: string;
  os?: string;
  weight?: string;
  connectivity?: string;
  waterproof?: string;
  [key: string]: string | undefined;
}

// ============================================
// PRODUTO PRINCIPAL
// ============================================

/**
 * Produto Base - campos obrigatórios
 */
export interface ProductBase {
  id: string;
  name: string;
  slug: string;
  price: number;
}

/**
 * Produto Completo - usado no backend e admin
 */
export interface Product extends ProductBase {
  // Identificação
  sku?: string;
  
  // Preços
  discountPrice?: number;
  costPrice?: number;
  originalPrice?: number;
  discountPercent?: number;
  
  // Descrição
  description?: string;
  shortDescription?: string;
  
  // Mídia
  image?: string;
  images?: string | string[];
  video?: string;
  
  // Categorização
  categoryId?: string;
  brandId?: string;
  category?: ProductCategory | string;
  brand?: ProductBrand | string;
  
  // Inventário
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  
  // Status
  isActive?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  isNew?: boolean;
  status?: 'active' | 'inactive' | 'out-of-stock' | 'draft';
  inStock?: boolean;
  
  // Detalhes
  specifications?: ProductSpecifications | string;
  colors?: string[] | string;
  storage?: string[] | string;
  tags?: string[] | string;
  
  // Físico
  weight?: number;
  dimensions?: string;
  
  // Garantia
  warranty?: number | string;
  
  // Avaliações
  rating?: number;
  reviews?: number;
  totalReviews?: number;
  
  // Variações
  variations?: ProductVariation[];
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Datas
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// TIPOS PARA FORMULÁRIOS E DTOs
// ============================================

/**
 * Dados para criar um novo produto
 */
export interface CreateProductData {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  discountPercent?: number;
  stock?: number;
  categoryId?: string;
  brandId?: string;
  images?: string;
  specifications?: string;
  colors?: string;
  storage?: string;
  tags?: string;
  weight?: number;
  warranty?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

/**
 * Dados para atualizar um produto
 */
export interface UpdateProductData extends Partial<CreateProductData> {
  id?: string;
}

/**
 * Dados para criar uma variação
 */
export interface CreateVariationData {
  productId: string;
  name: string;
  sku: string;
  colorName?: string;
  colorCode?: string;
  colorImage?: string;
  storage?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  stock: number;
  image?: string;
}

// ============================================
// TIPOS PARA API
// ============================================

/**
 * Resposta de listagem de produtos
 */
export interface ProductsListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filtros de busca de produtos
 */
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Estatísticas de produtos
 */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
  featured: number;
  totalValue: number;
  averagePrice: number;
}

// ============================================
// TIPOS PARA CARRINHO
// ============================================

/**
 * Item do carrinho
 */
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  variationId?: string;
  warranty?: string;
  inStock: boolean;
}

/**
 * Item de favoritos
 */
export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  category?: string;
  addedAt: string;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Normaliza um produto para o formato padrão
 */
export function normalizeProduct(product: Partial<Product>): Product {
  return {
    id: product.id || '',
    name: product.name || '',
    slug: product.slug || '',
    price: product.price || 0,
    discountPrice: product.discountPrice,
    costPrice: product.costPrice,
    description: product.description,
    image: product.image || (typeof product.images === 'string' ? product.images.split(',')[0] : product.images?.[0]) || '',
    images: product.images,
    categoryId: product.categoryId,
    brandId: product.brandId,
    category: product.category,
    brand: product.brand,
    stock: product.stock ?? 0,
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? product.featured ?? false,
    featured: product.featured ?? product.isFeatured ?? false,
    specifications: product.specifications,
    colors: product.colors,
    storage: product.storage,
    tags: product.tags,
    weight: product.weight,
    warranty: product.warranty,
    rating: product.rating ?? 4.5,
    reviews: product.reviews ?? product.totalReviews ?? 0,
    variations: product.variations,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    inStock: product.inStock ?? (product.stock ?? 0) > 0,
  };
}

/**
 * Converte imagens de string para array
 */
export function parseImages(images: string | string[] | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  return images.split(',').map(img => img.trim()).filter(Boolean);
}

/**
 * Converte array para string separada por vírgula
 */
export function stringifyArray(arr: string[] | string | undefined): string {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  return arr.join(',');
}

/**
 * Parse de especificações
 */
export function parseSpecifications(specs: string | ProductSpecifications | undefined): ProductSpecifications {
  if (!specs) return {};
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  }
  return specs;
}

/**
 * Calcula o preço com desconto
 */
export function calculateDiscountPrice(price: number, discountPercent?: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return price * (1 - discountPercent / 100);
}

/**
 * Calcula a porcentagem de desconto
 */
export function calculateDiscountPercent(originalPrice: number, discountPrice: number): number {
  if (!originalPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}
