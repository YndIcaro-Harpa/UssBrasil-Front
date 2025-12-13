'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  User, 
  ShoppingBag, 
  Search, 
  X, 
  Menu, 
  ChevronDown, 
  Home, 
  Package, 
  Percent, 
  Phone, 
  Star,
  Heart,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Laptop,
  Headphones,
  Plane,
  Plug
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import data from '@/db.json'

// Tipos
export type Product = {
  id: string
  name: string
  brand: string | { id: string; name: string; logo?: string }
  description: string
  price: number
  discountPrice?: number | null
  image: string
  images: string | string[]
  category: string | { id: string; name: string }
  stock: number
  status: string
  tags: string[]
  featured: boolean
  rating: number
  totalReviews: number
  colors: string[]
  createdAt: string
  specifications: object
  paymentOptions: number
  slug?: string
}

type Brand = {
  key: string
  name: string
  logo: string
  products: Product[]
  description: string
}

type MainCategory = {
  name: string
  slug: string
  description: string
  image: string
  count: number
  products: Product[]
}

const ModernNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(3)
  const [favoriteCount, setFavoriteCount] = useState(2)
  
  const { theme, setTheme } = useTheme()
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Função para ajustar caminhos das imagens
  const fixPath = (path: string) => {
    if (!path) return ''
    if (path.startsWith('Ecommerce-UssBrasil/public/')) {
      return `/${path.replace('Ecommerce-UssBrasil/public/', '')}`
    }
    return path
  }

  // Processar produtos
  const products = data.products.map(p => ({
    ...p,
    image: fixPath(p.image),
    images: p.images?.map(fixPath) || [fixPath(p.image)]
  }))

  // Organizar produtos por marca
  const brandProducts: Record<string, Product[]> = {}
  products.forEach(product => {
    if (!brandProducts[product.brand]) {
      brandProducts[product.brand] = []
    }
    brandProducts[product.brand].push(product)
  })

  // Definir marcas principais
  const mainBrands = [
    { 
      name: 'Apple', 
      key: 'apple',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1763210062/uss-brasil/brands/02.png',
      description: 'Tecnologia que transforma vidas',
      categories: ['iPhone', 'MacBook', 'iPad', 'Apple Watch', 'AirPods']
    },
    { 
      name: 'JBL', 
      key: 'jbl',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1763210065/uss-brasil/brands/JBL_Logo.png',
      description: 'Som que emociona',
      categories: ['Caixas de Som', 'Fones de Ouvido', 'Soundbars']
    },
    { 
      name: 'DJI', 
      key: 'dji',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1763210063/uss-brasil/brands/Dji_Logo.jpg',
      description: 'Capturando o impossível',
      categories: ['Drones', 'Câmeras', 'Estabilizadores', 'Acessórios']
    },
    { 
      name: 'Xiaomi', 
      key: 'xiaomi',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1763210067/uss-brasil/brands/Xiomi_Logo.png',
      description: 'Inovação para todos',
      categories: ['Smartphones', 'Wearables', 'Smart Home', 'Acessórios']
    },
    { 
      name: 'Geonav', 
      key: 'geonav',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1763210064/uss-brasil/brands/GeoNav.jpg',
      description: 'Navegação de precisão',
      categories: ['GPS', 'Multimídia', 'Acessórios Automotivos']
    }
  ]

  // Mapeamento de ícones para categorias
  const iconMap: Record<string, React.ReactNode> = {
    smartphone: <Smartphone className="h-4 w-4" />,
    laptop: <Laptop className="h-4 w-4" />,
    headphones: <Headphones className="h-4 w-4" />,
    plane: <Plane className="h-4 w-4" />,
    plug: <Plug className="h-4 w-4" />,
  }

  // Categorias principais
  const mainCategories = [
    { name: 'Smartphones', slug: 'smartphones', icon: 'smartphone' },
    { name: 'Computadores', slug: 'computadores', icon: 'laptop' },
    { name: 'Áudio', slug: 'audio', icon: 'headphones' },
    { name: 'Drones', slug: 'drones', icon: 'plane' },
    { name: 'Acessórios', slug: 'acessorios', icon: 'plug' },
  ]

  // Buscar produtos com debounce via API
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearchLoading(true)
        try {
          const response = await fetch(`http://localhost:3001/products?search=${encodeURIComponent(searchTerm)}&limit=8`)
          const data = await response.json()
          setSearchResults(data.products || [])
        } catch (error) {
          console.error('Erro ao buscar produtos:', error)
          setSearchResults([])
        } finally {
          setIsSearchLoading(false)
        }
      } else {
        setSearchResults([])
        setIsSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatPrice = (price: number, discountPrice?: number | null) => {
    const finalPrice = discountPrice || price
    return `R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <header className="sticky top-0 z-50 bg-background backdrop-blur-none border-b border-border shadow-sm">
      {/* Primeira camada: Logo, Busca, Ícones */}
      <div className="bg-uss-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 md:h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-9 h-9 md:w-10 md:h-10 bg-white rounded-lg shadow-md p-1 group-hover:shadow-lg transition-all duration-300">
                <Image
                  src="/Empresa/02.png"
                  alt="USS Brasil"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">
                  USS<span className="text-uss-secondary">Brasil</span>
                </span>
                <span className="text-[8px] md:text-[9px] text-white/70 font-medium -mt-0.5 hidden sm:block">
                  Tecnologia Premium
                </span>
              </div>
            </Link>

            {/* Barra de Pesquisa - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6" ref={searchRef}>
              <div className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uss-gray-500 h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos, marcas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full h-8 pl-9 pr-3 text-sm bg-white text-uss-gray-900 rounded-md border-0 focus:ring-2 focus:ring-uss-secondary placeholder:text-uss-gray-500"
                  />
                </div>

                {/* Resultados da Busca */}
                <AnimatePresence>
                  {isSearchOpen && searchTerm.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
                    >
                      {/* Header do Preview */}
                      <div className="bg-gradient-to-r from-uss-primary to-uss-primary-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span className="font-semibold text-sm">
                            {isSearchLoading 
                              ? 'Buscando...'
                              : searchResults.length > 0 
                                ? `${searchResults.length} produto${searchResults.length > 1 ? 's' : ''} encontrado${searchResults.length > 1 ? 's' : ''}`
                                : 'Buscar produtos'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchTerm('')
                          }}
                          className="hover:bg-white/20 p-1 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {isSearchLoading ? (
                        <div className="p-8 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-uss-primary"></div>
                          <p className="text-gray-500 font-medium mt-3">Buscando produtos...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((product) => {
                            const discount = product.discountPrice 
                              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                              : 0

                            const productSlug = product.slug || product.id
                            const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Marca'
                            const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Categoria'
                            const productImages = typeof product.images === 'string' 
                              ? product.images.split(',').map(img => img.trim()) 
                              : product.images || []
                            const imageUrl = productImages[0] || product.image || '/fallback-product.png'

                            return (
                              <Link
                                key={product.id}
                                href={`/produto/${productSlug}`}
                                className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-uss-primary/5 hover:to-transparent transition-all duration-300 group"
                                onClick={() => {
                                  setIsSearchOpen(false)
                                  setSearchTerm('')
                                }}
                              >
                                {/* Imagem do Produto */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                    <Image
                                      src={imageUrl}
                                      alt={product.name}
                                      width={80}
                                      height={80}
                                      className="object-contain p-2 w-full h-full group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement
                                        img.src = '/fallback-product.png'
                                      }}
                                    />
                                  </div>
                                  {/* Badge de Desconto */}
                                  {discount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                      -{discount}%
                                    </div>
                                  )}
                                  {/* Badge de Estoque */}
                                  {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">Esgotado</span>
                                    </div>
                                  )}
                                </div>

                                {/* Informações do Produto */}
                                <div className="flex-1 min-w-0">
                                  {/* Nome e Marca */}
                                  <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-uss-primary transition-colors">
                                    {product.name}
                                  </h4>
                                  
                                  {/* Badges */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-white bg-gradient-to-r from-uss-primary to-uss-primary-dark px-2 py-1 rounded-md">
                                      {brandName}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                      {categoryName}
                                    </span>
                                    {product.featured && (
                                      <span className="text-xs text-white bg-gradient-to-r from-uss-cyan to-blue-500 px-2 py-1 rounded-md flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Destaque
                                      </span>
                                    )}
                                  </div>

                                  {/* Preços */}
                                  <div className="flex items-center gap-2">
                                    {product.discountPrice ? (
                                      <>
                                        <span className="text-sm text-gray-400 line-through">
                                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-uss-primary to-uss-cyan">
                                          R$ {product.discountPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-lg font-black text-gray-900">
                                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    )}
                                  </div>

                                  {/* Estoque */}
                                  {product.stock > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {product.stock <= 5 ? (
                                        <span className="text-orange-600 font-medium">Últimas {product.stock} unidades!</span>
                                      ) : (
                                        <span className="text-green-600">Em estoque</span>
                                      )}
                                    </p>
                                  )}
                                </div>

                                {/* Arrow Indicator */}
                                <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-uss-primary transform -rotate-90 group-hover:translate-x-1 transition-all flex-shrink-0" />
                              </Link>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
                          <p className="text-sm text-gray-400 mt-1">Tente buscar por outro termo</p>
                        </div>
                      )}

                      {/* Footer - Ver Todos */}
                      {searchResults.length > 0 && (
                        <Link
                          href={`/produtos?search=${encodeURIComponent(searchTerm)}`}
                          className="block bg-gradient-to-r from-gray-50 to-gray-100 hover:from-uss-primary/10 hover:to-uss-cyan/10 text-center py-3 border-t border-gray-200 transition-colors"
                          onClick={() => {
                            setIsSearchOpen(false)
                          }}
                        >
                          <span className="text-sm font-bold bg-blue-400 transition-colors">
                            Ver todos os resultados para "{searchTerm}" →
                          </span>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Ícones da Direita */}
            <div className="flex items-center space-x-2">
              {/* Busca Mobile */}
              <button
                className="md:hidden p-1.5 hover:bg-uss-primary-light rounded-md transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Favoritos - Apenas quando logado */}
              {isLoggedIn && (
                <Link
                  href="/favorites"
                  className="relative p-1.5 hover:bg-uss-primary-light rounded-md transition-colors hidden sm:block"
                >
                  <Heart className="h-4 w-4" />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-uss-secondary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {favoriteCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Perfil/Login */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="p-1.5 hover:bg-uss-primary-light rounded-md transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-border py-2 z-50"
                    >
                      {isLoggedIn ? (
                        <>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-uss-gray-900 hover:bg-uss-off-white"
                          >
                            Meu Perfil
                          </Link>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-uss-gray-900 hover:bg-uss-off-white"
                          >
                            Meus Pedidos
                          </Link>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-uss-error hover:bg-uss-off-white"
                            onClick={() => setIsLoggedIn(false)}
                          >
                            Sair
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="block px-4 py-2 text-sm text-uss-gray-900 hover:bg-uss-off-white"
                          >
                            Entrar
                          </Link>
                          <Link
                            href="/register"
                            className="block px-4 py-2 text-sm text-uss-gray-900 hover:bg-uss-off-white"
                          >
                            Criar Conta
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Carrinho */}
              <Link
                href="/cart"
                className="relative p-1.5 hover:bg-uss-primary-light rounded-md transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-uss-secondary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 hover:bg-uss-primary-light rounded-md transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Menu Mobile */}
              <button
                className="md:hidden p-1.5 hover:bg-uss-primary-light rounded-md transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Busca Mobile */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pb-2"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uss-gray-500 h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos, marcas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 text-sm bg-white text-uss-gray-900 rounded-md border-0 focus:ring-2 focus:ring-uss-secondary placeholder:text-uss-gray-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Segunda camada: Navegação Principal */}
      <div className="bg-white dark:bg-uss-gray-900">
        <div className="container mx-auto px-4">
          <nav className="hidden md:flex items-center justify-center space-x-6 h-9">
            {/* Produtos */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('produtos')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/products"
                className="flex items-center space-x-1 text-sm text-uss-gray-700 dark:text-uss-gray-300 hover:text-uss-primary dark:hover:text-uss-secondary transition-colors font-medium"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Produtos</span>
                <ChevronDown className="h-3 w-3" />
              </Link>

              <AnimatePresence>
                {activeDropdown === 'produtos' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-4xl bg-white dark:bg-uss-gray-800 rounded-lg shadow-xl border border-border z-50"
                  >
                    <div className="grid grid-cols-5 gap-6 p-6">
                      {mainBrands.map((brand) => (
                        <div key={brand.key} className="space-y-3">
                          <div className="flex items-center space-x-2 mb-3">
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                            <h3 className="font-semibold text-uss-gray-900 dark:text-white">
                              {brand.name}
                            </h3>
                          </div>
                          <p className="text-xs text-uss-gray-500 mb-2">{brand.description}</p>
                          {brand.categories.map((category) => (
                            <Link
                              key={category}
                              href={`/products?brand=${brand.key}&category=${category.toLowerCase()}`}
                              className="block text-sm text-uss-gray-600 dark:text-uss-gray-400 hover:text-uss-primary dark:hover:text-uss-secondary transition-colors"
                            >
                              {category}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Categorias */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('categorias')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/categories"
                className="flex items-center space-x-1 text-sm text-uss-gray-700 dark:text-uss-gray-300 hover:text-uss-primary dark:hover:text-uss-secondary transition-colors font-medium"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Categorias</span>
                <ChevronDown className="h-3 w-3" />
              </Link>

              <AnimatePresence>
                {activeDropdown === 'categorias' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white dark:bg-uss-gray-800 rounded-lg shadow-xl border border-border z-50"
                  >
                    <div className="p-4 space-y-2">
                      {mainCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-uss-off-white dark:hover:bg-uss-gray-700 transition-colors"
                        >
                          <span className="text-uss-primary">{iconMap[category.icon]}</span>
                          <span className="text-uss-gray-700 dark:text-uss-gray-300">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ofertas */}
            <Link
              href="/ofertas"
              className="flex items-center space-x-1 text-sm text-uss-gray-700 dark:text-uss-gray-300 hover:text-uss-primary dark:hover:text-uss-secondary transition-colors font-medium"
            >
              <Percent className="h-3.5 w-3.5" />
              <span>Ofertas</span>
            </Link>

            {/* Contato */}
            <Link
              href="/contato"
              className="flex items-center space-x-1 text-sm text-uss-gray-700 dark:text-uss-gray-300 hover:text-uss-primary dark:hover:text-uss-secondary transition-colors font-medium"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Contato</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-uss-gray-900 border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/products"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-uss-off-white dark:hover:bg-uss-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-5 w-5 text-uss-primary" />
                <span className="text-uss-gray-700 dark:text-uss-gray-300 font-medium">Produtos</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-uss-off-white dark:hover:bg-uss-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-5 w-5 text-uss-primary" />
                <span className="text-uss-gray-700 dark:text-uss-gray-300 font-medium">Categorias</span>
              </Link>
              <Link
                href="/ofertas"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-uss-off-white dark:hover:bg-uss-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Percent className="h-5 w-5 text-uss-primary" />
                <span className="text-uss-gray-700 dark:text-uss-gray-300 font-medium">Ofertas</span>
              </Link>
              <Link
                href="/contato"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-uss-off-white dark:hover:bg-uss-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="h-5 w-5 text-uss-primary" />
                <span className="text-uss-gray-700 dark:text-uss-gray-300 font-medium">Contato</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default ModernNavbar

