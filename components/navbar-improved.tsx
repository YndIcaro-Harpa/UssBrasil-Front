'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Menu, X, User, ShoppingBag, Heart, ChevronDown,
  Smartphone, Headphones, Camera, Watch, Laptop, Gamepad2, Package,
  LogOut, Settings, ShoppingCart, MapPin
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [brands, setBrands] = useState<NavbarBrand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const { cartItems } = useCart()
  const { favorites, user, logout } = useAuth()
  const { openAuthModal } = useModal()
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    // Remove all USS auth data
    localStorage.removeItem('uss_auth_token')
    localStorage.removeItem('uss_user_data')
    localStorage.removeItem('uss_favorites')
    localStorage.removeItem('uss_orders')
    localStorage.removeItem('uss_addresses')
    localStorage.removeItem('uss_payment_methods')
    logout?.()
    setIsProfileDropdownOpen(false)
    window.location.href = '/'
  }

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
        <nav className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 md:w-14 md:h-14  p-1.5 group-hover:shadow-xl transition-all duration-300">
                <Image
                  src="/Empresa/05.png"
                  alt="UssBrasil"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                  <span className="text-blue-900">UssBrasil</span>
                </span>
                <span className="text-[9px] md:text-[10px] text-gray-500 font-medium -mt-0.5 hidden sm:block">
                  Tecnologia
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-400 font-medium transition-colors">
                Home
              </Link>
              
              {/* Dropdown Produtos */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown('products')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-400 font-medium transition-colors"
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
                                href={`/produtos?brand=${brand.slug}`}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {brand.logo ? (
                                  <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-md border border-gray-100 flex items-center justify-center overflow-hidden">
                                    <Image
                                      src={brand.logo}
                                      alt={brand.name}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                ) : (
                                  <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-600">
                                      {brand.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 group-hover:text-uss-primary transition-colors">
                                    {brand.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Ver produtos
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <Link
                          href="/produtos"
                          className="block w-full text-center bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Ver Todos os Produtos
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/categorias" className="text-gray-700 hover:text-blue-400 font-medium transition-colors">
                Categorias
              </Link>
              
              <Link href="/sobre" className="text-gray-700 hover:text-blue-400 font-medium transition-colors">
                Sobre
              </Link>
              
              <Link href="/contato" className="text-gray-700 hover:text-blue-400 font-medium transition-colors">
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
                className="relative p-2 text-gray-700 hover:text-blue-400 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Login/User */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    if (user) {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    } else {
                      openAuthModal()
                    }
                  }}
                  className="p-2 text-gray-700 hover:text-blue-400 transition-colors"
                >
                  <User className="h-6 w-6" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/perfil"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-5 h-5 text-gray-400" />
                          <span>Meu Perfil</span>
                        </Link>
                        <Link
                          href="/meus-pedidos"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5 text-gray-400" />
                          <span>Meus Pedidos</span>
                        </Link>
                        <Link
                          href="/favoritos"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-5 h-5 text-gray-400" />
                          <span>Favoritos</span>
                        </Link>
                        <Link
                          href="/rastreamento"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span>Rastrear Pedido</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-400"
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

                <Link href="/" className="block py-2 text-gray-700 hover:text-blue-400 font-medium">
                  Home
                </Link>
                <Link href="/produtos" className="block py-2 text-gray-700 hover:text-blue-400 font-medium">
                  Produtos
                </Link>
                <Link href="/categorias" className="block py-2 text-gray-700 hover:text-blue-400 font-medium">
                  Categorias
                </Link>
                <Link href="/sobre" className="block py-2 text-gray-700 hover:text-blue-400 font-medium">
                  Sobre
                </Link>
                <Link href="/contato" className="block py-2 text-gray-700 hover:text-blue-400 font-medium">
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
  const { cartItems = [], removeFromCart, updateQuantity, cartTotal } = useCart()

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

          {/* Sidebar Branca USS Brasil */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Carrinho ({cartItems.length})</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar carrinho"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-20 w-20 text-gray-300 mb-6" />
                  <p className="text-black text-lg mb-2 font-medium">Seu carrinho está vazio</p>
                  <p className="text-gray-500 text-sm mb-6">Adicione produtos para continuar</p>
                  <Button
                    onClick={onClose}
                    className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto mb-6">
                    {cartItems.map((item, index) => (
                      <div key={`cart-item-${item.id || index}`} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-16 h-16 relative bg-white rounded">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain rounded p-1"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                              <span className="text-gray-400 text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-black truncate mb-1">{item.name}</h3>
                          <p className="font-bold text-lg text-blue-500">
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center space-x-3 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-semibold transition-colors text-black"
                              aria-label="Diminuir quantidade"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-sm font-bold text-black min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-semibold transition-colors text-black"
                              aria-label="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                          aria-label="Remover item"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-6 space-y-4 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-black text-lg">Total:</span>
                      <span className="font-bold text-2xl text-black">
                        R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <Link href="/carrinho" onClick={onClose}>
                      <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all mb-3">
                        Finalizar Compra
                      </Button>
                    </Link>

                    <Link href="/produtos" onClick={onClose}>
                      <Button
                       className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all mb-3"
                      >
                        Ver Todos os Produtos
                      </Button>
                    </Link>
                  </div>
                </>
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
  const favoritesList = favorites || []
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (!favoritesList.length) {
      setFavoriteProducts([])
      return
    }
    setLoading(true)
    Promise.all(
      favoritesList.map((id: string) =>
        apiClient.getProductById(id).catch(() => null)
      )
    ).then((products) => {
      setFavoriteProducts(products.filter(Boolean))
      setLoading(false)
    })
  }, [isOpen, favoritesList])

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
          {/* Sidebar Branca USS Brasil */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Favoritos ({favoritesList.length})</h2>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar favoritos"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {favoritesList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Heart className="h-20 w-20 text-gray-300 mb-6" />
                  <p className="text-gray-600 text-lg mb-2 font-medium">Nenhum favorito ainda</p>
                  <p className="text-gray-500 text-sm mb-6">Adicione produtos aos favoritos</p>
                  <Button 
                    onClick={onClose} 
                    className="bg-uss-primary hover:bg-uss-primary-dark text-white px-8 py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    Explorar Produtos
                  </Button>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <span className="text-gray-500">Carregando favoritos...</span>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto mb-6">
                    <p className="text-gray-600 text-sm mb-4">
                      Você tem {favoriteProducts.length} {favoriteProducts.length === 1 ? 'produto favoritado' : 'produtos favoritados'}
                    </p>
                    <ul className="space-y-3">
                      {favoriteProducts.map((product) => {
                        const productImage = product.image || (product.images && product.images[0]) || '/Empresa/07.png'
                        return (
                        <li key={product.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            <Image 
                              src={productImage} 
                              alt={product.name} 
                              width={48} 
                              height={48} 
                              className="object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.src = '/Empresa/07.png'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 block truncate">{product.name}</span>
                            <span className="text-blue-500 font-bold text-sm block">R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div className="space-y-3 bg-white border-t border-gray-200 pt-6">
                    <Link href="/favoritos" onClick={onClose}>
                      <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                        Ver Todos os Favoritos
                      </Button>
                    </Link>
                    <Link href="/produtos" onClick={onClose}>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white hover:bg-blue-50 text-gray-900 font-medium py-3 border-2 border-gray-300 shadow-md hover:shadow-lg transition-all"
                      >
                        Ver Todos os Produtos
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NavbarImproved

