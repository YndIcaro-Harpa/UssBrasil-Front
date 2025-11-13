'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Menu, X, User, ShoppingBag, Heart, ChevronDown,
  Smartphone, Headphones, Camera, Watch, Laptop, Gamepad2, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import apiClient, { Brand } from '@/lib/api-client'

interface NavbarBrand extends Brand {
  count?: number
}

const NavbarImproved = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)
  const [isFavoritesSidebarOpen, setIsFavoritesSidebarOpen] = useState(false)
  const [brands, setBrands] = useState<NavbarBrand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const { items: cartItems } = useCart()
  const { favorites, user } = useAuth()
  const { openAuthModal } = useModal()
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Carregar marcas do backend
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsResponse = await apiClient.getBrands()
        setBrands(brandsResponse.slice(0, 5))
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
      }
    }
    loadBrands()
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/produtos?search=${encodeURIComponent(searchTerm)}`
    }
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10">
                <Image
                  src="/Empresa/02.png"
                  alt="USS Brasil"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                USS Brasil
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              
              {/* Dropdown Produtos */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown('products')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <span>Produtos</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    activeDropdown === 'products' ? 'rotate-180' : ''
                  }`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'products' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-6 z-50"
                    >
                      <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Marcas</h3>
                          <div className="space-y-2">
                            {brands.map((brand) => (
                              <Link
                                key={brand.id}
                                href={`/marcas/${brand.slug}`}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {brand.logo && (
                                  <div className="relative w-8 h-8">
                                    <Image
                                      src={brand.logo}
                                      alt={brand.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 group-hover:text-blue-600">
                                    {brand.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Ver produtos
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <Link
                          href="/produtos"
                          className="block w-full text-center bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Ver Todos os Produtos
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/categorias" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Categorias
              </Link>
              
              <Link href="/sobre" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sobre
              </Link>
              
              <Link href="/contato" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contato
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Favoritos */}
              <button
                onClick={() => setIsFavoritesSidebarOpen(true)}
                className="relative p-2 text-gray-700 hover:text-red-500 transition-colors"
              >
                <Heart className="h-6 w-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Carrinho */}
              <button
                onClick={() => setIsCartSidebarOpen(true)}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Login/User */}
              <button
                onClick={() => user ? null : openAuthModal()}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="h-6 w-6" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-200 py-4 space-y-4"
              >
                <div className="md:hidden mb-4">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </form>
                </div>

                <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link href="/produtos" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Produtos
                </Link>
                <Link href="/categorias" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Categorias
                </Link>
                <Link href="/sobre" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Sobre
                </Link>
                <Link href="/contato" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Contato
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartSidebarOpen} 
        onClose={() => setIsCartSidebarOpen(false)} 
      />

      {/* Favorites Sidebar */}
      <FavoritesSidebar 
        isOpen={isFavoritesSidebarOpen} 
        onClose={() => setIsFavoritesSidebarOpen(false)} 
      />
    </>
  )
}

// Cart Sidebar Component
function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Carrinho ({items.length})</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                  <Button onClick={onClose} className="bg-blue-900 hover:bg-blue-800">
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="object-contain rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                        <p className="text-blue-600 font-semibold">R$ {item.price.toLocaleString('pt-BR')}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-xl text-blue-600">
                        R$ {getTotalPrice().toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <Link href="/carrinho">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={onClose}>
                        Ver Carrinho Completo
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Favorites Sidebar Component
function FavoritesSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { favorites } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Favoritos ({favorites.length})</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum favorito ainda</p>
                  <Button onClick={onClose} className="bg-blue-900 hover:bg-blue-800">
                    Explorar Produtos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/favoritos">
                    <Button className="w-full bg-red-500 hover:bg-red-600" onClick={onClose}>
                      Ver Todos os Favoritos
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NavbarImproved