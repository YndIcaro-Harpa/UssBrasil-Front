'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Menu, 
  X, 
  User, 
  ShoppingBag, 
  Heart, 
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  Headphones,
  Smartphone,
  Zap,
  Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Tipos
interface Product {
  id: string
  name: string
  brand: string
  price: number
  discountPrice?: number
  image: string
  category: string
  rating: number
  featured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  icon?: React.ReactNode
  count: number
}

interface Brand {
  id: string
  name: string
  logo: string
  image?: string
  count: number
  bgColor?: string
}

const ProfessionalNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount] = useState(3)
  const [favoriteCount] = useState(5)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Categorias principais com ícones e imagens
  const mainCategories: Category[] = [
    {
      id: '1',
      name: 'Fones de Ouvido',
      slug: 'fones-de-ouvido',
      image: '/images/JBL/JBL_Charge5.png',
      icon: <Headphones className="h-5 w-5" />,
      count: 48
    },
    {
      id: '2', 
      name: 'Celulares',
      slug: 'celulares-smartphones',
      image: '/images/Xiomi/Xiomi-12.png',
      icon: <Smartphone className="h-5 w-5" />,
      count: 156
    },
    {
      id: '3',
      name: 'Acessórios',
      slug: 'acessorios',
      image: '/images/Apple/Apple-Pen.png',
      icon: <Zap className="h-5 w-5" />,
      count: 89
    },
    {
      id: '4',
      name: 'Drones',
      slug: 'drones', 
      image: '/images/Dji/DJI_Mini.png',
      icon: <Gift className="h-5 w-5" />,
      count: 24
    }
  ]

  // Marcas principais com logos e cores
  const mainBrands: Brand[] = [
    {
      id: '1',
      name: 'Apple',
      logo: '/images/Apple/Apple_Logo.png',
      image: '/images/Apple/Imac.png',
      count: 45,
      bgColor: 'from-black to-gray-800'
    },
    {
      id: '2',
      name: 'JBL',
      logo: '/images/JBL/JBL_Logo.png',
      image: '/images/JBL/JBL_Charge5.png',
      count: 34,
      bgColor: 'from-blue-600 to-blue-800'
    },
    {
      id: '3',
      name: 'Xiaomi',
      logo: '/images/Xiomi/Xiomi_Logo.png',
      image: '/images/Xiomi/Xiomi-12.png',
      count: 67,
      bgColor: 'from-orange-500 to-orange-700'
    },
    {
      id: '4',
      name: 'DJI',
      logo: '/images/Dji/DJI_Logo.png',
      image: '/images/Dji/DJI_Mini.png',
      count: 23,
      bgColor: 'from-red-600 to-red-800'
    },
    {
      id: '5',
      name: 'Geonav',
      logo: '/images/Geonav/Geonav_Logo.png',
      image: '/images/Geonav/Geonav_G5.png',
      count: 28,
      bgColor: 'from-green-600 to-green-800'
    }
  ]

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1a365d] text-white text-sm py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>contato@uss-brasil.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>São Paulo, SP</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/ofertas" className="hover:text-[#48bb78] transition-colors">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              Ofertas do Dia
            </Link>
            <Link href="/rastreamento" className="hover:text-[#48bb78] transition-colors">
              <Package className="h-4 w-4 inline mr-1" />
              Rastrear Pedido
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.header 
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-lg border-b' : 'border-b border-gray-100'
        }`}
        initial={{ y: 0 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="relative">
                <Image
                  src="/images/logo-uss-brasil.png"
                  alt="USS Brasil"
                  width={60}
                  height={60}
                  className="h-10 sm:h-12 lg:h-14 w-auto"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#1a365d] font-medium transition-colors"
              >
                Início
              </Link>
              
              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown('categories')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-[#1a365d] font-medium transition-colors"
                >
                  <span>Categorias</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    activeDropdown === 'categories' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'categories' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mainCategories.map((category) => (
                          <motion.div key={category.id} whileHover={{ y: -4 }} className="cursor-pointer">
                            <Link
                              href={`/categorias/${category.slug}`}
                              className="block group"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="relative h-32 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  width={120}
                                  height={120}
                                  className="object-contain h-24 w-24 group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement
                                    img.style.display = 'none'
                                  }}
                                />
                                {category.icon && (
                                  <div className="absolute top-2 right-2 p-2 bg-[#1a365d] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    {category.icon}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#1a365d] transition-colors">{category.name}</h3>
                                <p className="text-xs text-gray-500">{category.count} produtos</p>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brands Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('brands')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-[#1a365d] font-medium transition-colors"
                >
                  <span>Marcas</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    activeDropdown === 'brands' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'brands' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-screen max-w-5xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {mainBrands.map((brand) => (
                          <motion.div key={brand.id} whileHover={{ y: -4 }} className="cursor-pointer">
                            <Link
                              href={`/marcas/${brand.name.toLowerCase()}`}
                              className="block group h-full"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className={`relative h-40 w-full bg-gradient-to-br ${brand.bgColor || 'from-gray-50 to-gray-100'} rounded-lg overflow-hidden mb-3 flex flex-col items-center justify-center p-3 group-hover:shadow-lg transition-all`}>
                                {/* Logo do brand */}
                                <div className="h-12 flex items-center justify-center mb-2">
                                  <Image
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    width={80}
                                    height={40}
                                    className="object-contain h-12 w-auto group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement
                                      img.style.display = 'none'
                                    }}
                                  />
                                </div>
                                {/* Imagem do produto */}
                                {brand.image && (
                                  <div className="h-20 flex items-center justify-center">
                                    <Image
                                      src={brand.image}
                                      alt={brand.name}
                                      width={80}
                                      height={80}
                                      className="object-contain h-16 w-auto group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement
                                        img.style.display = 'none'
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#1a365d] transition-colors">{brand.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{brand.count} produtos</p>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/ofertas" 
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Ofertas
              </Link>
              
              <Link 
                href="/contato" 
                className="text-gray-700 hover:text-[#1a365d] font-medium transition-colors"
              >
                Contato
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-sm lg:max-w-lg mx-4 lg:mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-[#1a365d] transition-colors text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              
              {/* Search Mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Buscar"
              >
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" />
              </button>

              {/* Favorites */}
              <Link
                href="/favoritos"
                className="hidden sm:flex relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Favoritos"
              >
                <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" />
                {favoriteCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/carrinho"
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Carrinho"
              >
                <ShoppingBag className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#1a365d] text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <Link
                href="/login"
                className="hidden sm:flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Minha Conta"
              >
                <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Menu"
              >
                <Menu className="h-4 sm:h-5 w-4 sm:w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 lg:hidden"
          >
            <div className="flex items-center p-4 border-b">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-[#1a365d]"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            
            <nav className="p-4 space-y-4">
              <Link
                href="/"
                className="block py-3 px-4 text-gray-700 hover:text-[#1a365d] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              
              {/* Categorias Mobile */}
              <div className="border-t pt-4">
                <h3 className="text-gray-900 font-bold text-sm mb-4 px-4 uppercase tracking-wide">Categorias</h3>
                <div className="space-y-2">
                  {mainCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categorias/${category.slug}`}
                      className="flex items-center space-x-3 p-3 mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="object-contain h-8 w-8"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6-7 6 7M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/></svg>'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-500">{category.count} produtos</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Marcas Mobile */}
              <div className="border-t pt-4">
                <h3 className="text-gray-900 font-bold text-sm mb-4 px-4 uppercase tracking-wide">Marcas</h3>
                <div className="grid grid-cols-3 gap-2 px-2">
                  {mainBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/marcas/${brand.name.toLowerCase()}`}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-2 flex-shrink-0">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={32}
                          height={32}
                          className="object-contain h-6 w-6"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = 'none'
                          }}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 text-xs text-center">{brand.name}</h4>
                      <p className="text-xs text-gray-500">{brand.count}</p>
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link
                href="/ofertas"
                className="block py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors border-t mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                🔥 Ofertas Especiais
              </Link>
              
              <Link
                href="/favoritos"
                className="flex items-center space-x-2 py-3 px-4 text-gray-700 hover:text-[#1a365d] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                <span>Favoritos ({favoriteCount})</span>
              </Link>
              
              <Link
                href="/login"
                className="flex items-center space-x-2 py-3 px-4 text-gray-700 hover:text-[#1a365d] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Minha Conta</span>
              </Link>
              
              <Link
                href="/contato"
                className="block py-3 px-4 text-gray-700 hover:text-[#1a365d] hover:bg-gray-50 font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ProfessionalNavbar
