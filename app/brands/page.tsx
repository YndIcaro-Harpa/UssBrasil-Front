'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Award, ArrowRight, Sparkles, Package, 
  ChevronRight, Loader2, Star, Shield,
  TrendingUp, Zap
} from 'lucide-react'
import { brandsApi, api, Brand, Product } from '@/services/api'

// Animações premium
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -8, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const } }
}

// Logos padrão das marcas
const brandLogos: Record<string, string> = {
  apple: '/images/brands/apple.png',
  jbl: '/images/brands/jbl.png',
  xiaomi: '/images/brands/xiaomi.png',
  samsung: '/images/brands/samsung.png',
  beats: '/images/brands/beats.png',
  sony: '/images/brands/sony.png',
  bose: '/images/brands/bose.png',
}

// Cores personalizadas por marca
const brandColors: Record<string, { bg: string; text: string; accent: string }> = {
  apple: { bg: 'from-gray-900 to-gray-800', text: 'text-white', accent: 'bg-white/10' },
  jbl: { bg: 'from-orange-600 to-orange-500', text: 'text-white', accent: 'bg-white/20' },
  xiaomi: { bg: 'from-orange-500 to-amber-500', text: 'text-white', accent: 'bg-white/20' },
  samsung: { bg: 'from-blue-600 to-blue-500', text: 'text-white', accent: 'bg-white/20' },
  beats: { bg: 'from-red-600 to-red-500', text: 'text-white', accent: 'bg-white/20' },
  default: { bg: 'from-[#001941] to-[#023a58]', text: 'text-white', accent: 'bg-white/10' }
}

interface BrandWithProducts extends Brand {
  productCount?: number
  featuredProducts?: Product[]
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null)

  useEffect(() => {
    const loadBrands = async () => {
      try {
        // Carregar marcas
        const brandsData = await brandsApi.getAll()
        
        // Carregar produtos para cada marca (para contagem e destaque)
        const brandsWithProducts = await Promise.all(
          brandsData.map(async (brand) => {
            try {
              const productsResponse = await api.products.getAll({ 
                brandId: brand.id, 
                limit: 4 
              })
              const products = Array.isArray(productsResponse) 
                ? productsResponse 
                : productsResponse.data || []
              
              return {
                ...brand,
                productCount: brand._count?.products || products.length,
                featuredProducts: products.slice(0, 3)
              }
            } catch {
              return { ...brand, productCount: brand._count?.products || 0, featuredProducts: [] }
            }
          })
        )

        // Ordenar por quantidade de produtos (mais populares primeiro)
        brandsWithProducts.sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        setBrands(brandsWithProducts)
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadBrands()
  }, [])

  const getBrandColors = (slug: string) => {
    return brandColors[slug.toLowerCase()] || brandColors.default
  }

  const getBrandLogo = (brand: Brand) => {
    if (brand.logo) return brand.logo
    return brandLogos[brand.slug.toLowerCase()] || '/images/brands/default.png'
  }

  const parseProductImage = (images: string | undefined): string | null => {
    if (!images) return null
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
      return null
    } catch {
      return images.startsWith('http') ? images : null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#001941]/20 border-t-[#001941] rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#001941]" />
          </div>
          <p className="text-gray-500 font-medium">Carregando marcas...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #001941 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#001941]/5 backdrop-blur-sm border border-[#001941]/10 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Award className="h-4 w-4 text-[#001941]" />
              <span className="text-sm font-semibold text-[#001941] tracking-wide">
                MARCAS PREMIUM
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Nossas{' '}
              <span className="bg-gradient-to-r from-[#001941] to-blue-600 bg-clip-text text-transparent">
                Marcas
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Trabalhamos exclusivamente com as marcas mais renomadas do mercado, 
              garantindo qualidade e originalidade em cada produto.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="flex items-center justify-center gap-8 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-[#001941]">{brands.length}</p>
                <p className="text-sm text-gray-500">Marcas Parceiras</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#001941]">
                  {brands.reduce((acc, b) => acc + (b.productCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Produtos Disponíveis</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="h-5 w-5 text-green-500" />
                  <p className="text-3xl font-bold text-[#001941]">100%</p>
                </div>
                <p className="text-sm text-gray-500">Originais</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Brands Section */}
      {brands.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {brands.slice(0, 3).map((brand, index) => {
                const colors = getBrandColors(brand.slug)
                return (
                  <motion.div
                    key={brand.id}
                    variants={fadeInUp}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                  >
                    <Link href={`/brands/${brand.slug}`}>
                      <motion.div 
                        variants={cardHover}
                        className={`relative bg-gradient-to-br ${colors.bg} rounded-3xl p-8 h-64 overflow-hidden group cursor-pointer`}
                      >
                        {/* Background Glow */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 ${colors.accent} rounded-full mb-4`}>
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className={`text-xs font-semibold ${colors.text}`}>Destaque</span>
                            </div>
                            
                            <div className="h-16 mb-4 flex items-center">
                              <Image
                                src={getBrandLogo(brand)}
                                alt={brand.name}
                                width={140}
                                height={60}
                                className="object-contain brightness-0 invert max-h-14"
                              />
                            </div>
                            
                            {brand.description && (
                              <p className={`${colors.text} opacity-80 text-sm line-clamp-2`}>
                                {brand.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`${colors.text} opacity-70 text-sm`}>
                              {brand.productCount || 0} produtos
                            </span>
                            <div className={`flex items-center gap-2 ${colors.text} font-medium group-hover:gap-3 transition-all`}>
                              <span className="text-sm">Explorar</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* All Brands Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            className="flex items-center justify-between mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Todas as Marcas</h2>
              <p className="text-gray-500 mt-1">Encontre produtos por marca</p>
            </div>
          </motion.div>

          {/* Brands Grid */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                variants={fadeInUp}
                onMouseEnter={() => setHoveredBrand(brand.id)}
                onMouseLeave={() => setHoveredBrand(null)}
              >
                <Link href={`/brands/${brand.slug}`}>
                  <motion.div 
                    className={`
                      relative bg-white rounded-2xl p-6 border border-gray-100 
                      transition-all duration-300 group cursor-pointer
                      ${hoveredBrand === brand.id ? 'shadow-xl border-[#001941]/20 bg-gradient-to-b from-white to-gray-50' : 'shadow-sm hover:shadow-md'}
                    `}
                    whileHover={{ y: -4 }}
                  >
                    {/* Product Count Badge */}
                    <div className="absolute -top-2 -right-2 bg-[#001941] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {brand.productCount || 0}
                    </div>
                    
                    {/* Logo */}
                    <div className="h-16 mb-4 flex items-center justify-center">
                      <Image
                        src={getBrandLogo(brand)}
                        alt={brand.name}
                        width={100}
                        height={50}
                        className="object-contain max-h-12 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Brand Name */}
                    <h3 className="font-semibold text-gray-900 text-center text-sm mb-1 line-clamp-1">
                      {brand.name}
                    </h3>
                    
                    {/* CTA */}
                    <div className="flex items-center justify-center gap-1 text-[#001941] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ver produtos</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {brands.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma marca encontrada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Estamos trabalhando para adicionar novas marcas em breve.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gradient-to-r from-[#001941] to-[#023a58]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">100% Original</h3>
              <p className="text-white/70 text-sm">
                Todos os produtos são originais e com garantia de fábrica
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Entrega Rápida</h3>
              <p className="text-white/70 text-sm">
                Receba seu pedido em até 48h para capitais
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Melhor Preço</h3>
              <p className="text-white/70 text-sm">
                Garantia de melhor preço do mercado brasileiro
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
