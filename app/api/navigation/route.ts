import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/config'


/**
 * GET /api/navigation - Obtém dados de navegação (marcas e categorias)
 * Faz proxy para o backend NestJS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    // Buscar marcas e categorias em paralelo
    const [brandsResponse, categoriesResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/brands`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      }),
      fetch(`${BACKEND_URL}/categories`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      }),
    ])

    let brands = []
    let categories = []

    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json()
      brands = brandsData.data || brandsData || []
    }

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      categories = categoriesData.data || categoriesData || []
    }

    // Se incluir produtos, buscar produtos em destaque para cada marca
    if (includeProducts && brands.length > 0) {
      const productsResponse = await fetch(`${BACKEND_URL}/products/featured?limit=10`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      })

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        const featuredProducts = productsData.data || productsData || []

        // Agrupar produtos por marca
        brands = brands.map((brand: any) => ({
          ...brand,
          featured_products: featuredProducts.filter(
            (p: any) => p.brandId === brand.id || p.brand?.id === brand.id
          ).slice(0, 3)
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        brands,
        categories,
      }
    })
  } catch (error) {
    console.error('[API Navigation] Erro:', error)
    
    // Fallback com dados mínimos em caso de erro total
    return NextResponse.json({
      success: true,
      data: {
        brands: [],
        categories: [],
      },
      message: 'Dados de fallback - backend indisponível'
    })
  }
}
