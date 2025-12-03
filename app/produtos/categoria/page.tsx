'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Smartphone, Headphones, Camera, Watch, Package, Loader2, 
  ArrowRight, Sparkles, TrendingUp, Zap, Grid, Search, Tag, Star
} from 'lucide-react'
import apiClient, { Category } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mapeamento de ícones para categorias
const categoryIcons: Record<string, any> = {
  'smartphones': Smartphone,
  'iphone': Smartphone,
  'apple': Smartphone,
  'audio': Headphones,
  'fone': Headphones,
  'jbl': Headphones,
  'cameras': Camera,
  'dji': Camera,
  'drone': Camera,
  'relogios': Watch,
  'watch': Watch,
  'acessorios': Package,
  'geonav': Package,
  'xiaomi': Smartphone,
}

// Gradientes premium para categorias
const getCategoryGradient = (index: number) => {
  const gradients = [
    { from: 'from-blue-600', via: 'via-blue-700', to: 'to-blue-400', border: 'border-blue-500/20', shadow: 'shadow-blue-500/50' },
    { from: 'from-purple-600', via: 'via-purple-700', to: 'to-purple-900', border: 'border-purple-500/20', shadow: 'shadow-purple-500/50' },
    { from: 'from-pink-600', via: 'via-pink-700', to: 'to-pink-900', border: 'border-pink-500/20', shadow: 'shadow-pink-500/50' },
    { from: 'from-orange-600', via: 'via-orange-700', to: 'to-orange-900', border: 'border-orange-500/20', shadow: 'shadow-orange-500/50' },
    { from: 'from-green-600', via: 'via-green-700', to: 'to-green-900', border: 'border-green-500/20', shadow: 'shadow-green-500/50' },
    { from: 'from-cyan-600', via: 'via-cyan-700', to: 'to-cyan-900', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/50' },
  ]
  return gradients[index % gradients.length]
}

// Animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getProducts({ limit: 1000 })
        ])

        setCategories(categoriesRes.filter((c: Category) => c.featured || true))

        // Contar produtos por categoria
        const counts: Record<string, number> = {}
        productsRes.forEach((product: any) => {
          const catId = product.category?.id || product.categoryId
          if (catId) {
            counts[catId] = (counts[catId] || 0) + 1
          }
        })
        setProductCounts(counts)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar categorias por busca
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = Object.values(productCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-6" />
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <Sparkles className="w-6 h-6 text-cyan-500 absolute top-0 right-0 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">Carregando categorias premium...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando a melhor experiência para você</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section Premium */}
      <section className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 text-white overflow-hidden pt-20 sm:pt-24 pb-16 sm:pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 shadow-2xl shadow-cyan-500/50">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline animate-pulse" />
                {categories.length} Categorias Premium
              </Badge>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight"
            >
              Descubra o Universo
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                USS Brasil
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto px-4"
            >
              Explore {categories.length} categorias com {totalProducts} produtos das melhores marcas do mercado
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base"
            >
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                </div>
                <span className="text-gray-300">{categories.length} Categorias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <span className="text-gray-300">{totalProducts} Produtos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <span className="text-gray-300">Qualidade Premium</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid Premium */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <AnimatePresence mode="wait">
            {filteredCategories.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
              >
                {filteredCategories.map((category, index) => {
                  const Icon = categoryIcons[category.slug.toLowerCase()] || Package
                  const productCount = productCounts[category.id] || 0
                  const gradient = getCategoryGradient(index)

                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover={{ y: -12, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`/produtos?category=${category.slug}`}
                        className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-300 block h-full"
                      >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                        
                        {/* Background Image (se disponível) */}
                        {category.image && (
                          <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            
                            {/* Floating Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-bold shadow-lg">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {productCount}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="p-5 sm:p-6 lg:p-7 relative">
                          {/* Icon Container Premium */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`relative bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${gradient.shadow} shadow-lg`}>
                              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                              
                              {/* Glow Effect */}
                              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                            </div>

                            {!category.image && (
                              <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs">
                                {productCount} {productCount === 1 ? 'item' : 'itens'}
                              </Badge>
                            )}
                          </div>

                          {/* Category Info */}
                          <div className="space-y-2 sm:space-y-3">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-blue-400 transition-colors leading-tight">
                              {category.name}
                            </h3>
                            
                            {category.description && (
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {category.description}
                              </p>
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-400">
                              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Ver Produtos</span>
                            </div>
                            
                            <div className="bg-blue-100 group-hover:bg-blue-400 p-2 rounded-xl transition-colors duration-300">
                              <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                          </div>
                        </div>

                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16 sm:py-20"
              >
                <div className="bg-gray-100 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Sem categorias disponíveis'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `Não encontramos categorias com "${searchTerm}". Tente outro termo.`
                    : 'Estamos preparando novas categorias para você!'
                  }
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    Limpar Busca
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section Premium */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-16 text-center text-white shadow-2xl overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-6"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/50">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
                Não encontrou o que procura?
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                Nossa equipe está pronta para ajudá-lo a encontrar o produto perfeito para suas necessidades
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-xl mx-auto">
                <Link href="/produtos" className="flex-1">
                  <Button className="w-full bg-white hover:bg-gray-100 text-black-900 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-white">
                    <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Ver Todos os Produtos
                  </Button>
                </Link>
                <a
                  href="https://wa.me/5548991832760"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-green-400">
                    <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Falar no WhatsApp
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Entrega Rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-cyan-400" />
                  <span>Qualidade Premium</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

