const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

interface GetProductsParams {
  limit?: number
  page?: number
  category?: string
  brand?: string
  search?: string
}

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  discountPrice: number | null
  image: string
  stock: number
  status: string
}

interface GetProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export const apiClient = {
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.brand) queryParams.append('brand', params.brand)
    if (params?.search) queryParams.append('search', params.search)

    const url = `${API_URL}/products?${queryParams.toString()}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos')
    }
    
    return response.json()
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/slug/${slug}`)
    
    if (!response.ok) {
      throw new Error('Produto não encontrado')
    }
    
    return response.json()
  },

  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`)
    
    if (!response.ok) {
      throw new Error('Produto não encontrado')
    }
    
    return response.json()
  }
}
