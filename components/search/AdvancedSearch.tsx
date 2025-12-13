'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  Star,
  Tag,
  ChevronRight,
  Sparkles,
  Zap,
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Plane
} from 'lucide-react'

// Icon map for categories
const categoryIconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone className="w-4 h-4" />,
  headphones: <Headphones className="w-4 h-4" />,
  laptop: <Laptop className="w-4 h-4" />,
  watch: <Watch className="w-4 h-4" />,
  plane: <Plane className="w-4 h-4" />,
}
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  name: string
  price: number
  discountPrice?: number
  image: string
  category: string
  brand: string
  slug: string
  rating?: number
  inStock: boolean
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'history'
  text: string
  icon?: React.ReactNode
}

// Termos populares de busca
const popularSearches = [
  'iPhone 15 Pro',
  'AirPods Pro',
  'MacBook Air',
  'Apple Watch',
  'JBL Flip 6',
  'Xiaomi Watch'
]

// Categorias para sugestões
const categories = [
  { name: 'Smartphones', slug: 'smartphones', icon: 'smartphone' },
  { name: 'Áudio', slug: 'audio', icon: 'headphones' },
  { name: 'Notebooks', slug: 'notebooks', icon: 'laptop' },
  { name: 'Smartwatches', slug: 'smartwatches', icon: 'watch' },
  { name: 'Drones', slug: 'drones', icon: 'plane' },
]

// Marcas
const brands = [
  { name: 'Apple', slug: 'apple' },
  { name: 'JBL', slug: 'jbl' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'DJI', slug: 'dji' },
]

export default function AdvancedSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  // Salvar busca no histórico
  const saveToHistory = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Limpar histórico
  const clearHistory = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Buscar produtos
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `http://localhost:3001/products?search=${encodeURIComponent(searchQuery)}&limit=8`
      )
      
      if (response.ok) {
        const data = await response.json()
        const products = data.products || data
        
        setResults(products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
          image: p.images?.[0] || p.image || '/fallback-product.png',
          category: typeof p.category === 'string' ? p.category : p.category?.name || 'Produto',
          brand: typeof p.brand === 'string' ? p.brand : p.brand?.name || '',
          slug: p.slug || p.id,
          rating: p.rating,
          inStock: p.stock > 0
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Gerar sugestões de autocomplete
  const generateSuggestions = useCallback((searchQuery: string) => {
    const q = searchQuery.toLowerCase()
    const newSuggestions: SearchSuggestion[] = []

    popularSearches
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(text => {
        newSuggestions.push({ type: 'product', text, icon: <TrendingUp className="w-4 h-4" /> })
      })

    categories
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(cat => {
        newSuggestions.push({ type: 'category', text: cat.name, icon: categoryIconMap[cat.icon] || <Tag className="w-4 h-4" /> })
      })

    brands
      .filter(b => b.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(brand => {
        newSuggestions.push({ type: 'brand', text: brand.name, icon: <Tag className="w-4 h-4" /> })
      })

    setSuggestions(newSuggestions)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query)
        generateSuggestions(query)
      } else {
        setResults([])
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch, generateSuggestions])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/produto/${results[selectedIndex].slug}`)
        setIsOpen(false)
      } else if (query.trim()) {
        saveToHistory(query)
        router.push(`/produtos?search=${encodeURIComponent(query)}`)
        setIsOpen(false)
      }
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category') {
      router.push(`/categorias/${suggestion.text.toLowerCase()}`)
    } else if (suggestion.type === 'brand') {
      router.push(`/produtos?brand=${suggestion.text.toLowerCase()}`)
    } else {
      setQuery(suggestion.text)
      saveToHistory(suggestion.text)
    }
    setIsOpen(false)
  }

  const handleProductClick = (result: SearchResult) => {
    saveToHistory(result.name)
    setIsOpen(false)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Input de Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Buscar produtos, marcas, categorias..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-12 pl-12 pr-12 text-base bg-white border-gray-200 rounded-2xl shadow-sm focus:shadow-md focus:border-blue-400 transition-all"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setResults([])
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[80vh] overflow-y-auto">
              
              {/* Estado Inicial */}
              {!query && (
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Buscas Recentes
                        </h3>
                        <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">
                          Limpar
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(term); performSearch(term) }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      Buscas Populares
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(term); performSearch(term) }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" />
                      Categorias
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categorias/${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl"
                        >
                          <span className="text-gray-600">{categoryIconMap[cat.icon]}</span>
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                </div>
              )}

              {/* Sugestões */}
              {!isLoading && query && suggestions.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 px-2">Sugestões</p>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                      >
                        <span className="text-gray-400">{suggestion.icon}</span>
                        <span className="text-sm text-gray-700">{suggestion.text}</span>
                        <span className="text-xs text-gray-400 ml-auto capitalize">{suggestion.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados */}
              {!isLoading && query && results.length > 0 && (
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-2 px-2">{results.length} produto(s)</p>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <Link
                        key={result.id}
                        href={`/produto/${result.slug}`}
                        onClick={() => handleProductClick(result)}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                          selectedIndex === index ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={result.image} alt={result.name} width={56} height={56} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{result.brand}</span>
                            {result.rating && (
                              <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                                <Star className="w-3 h-3 fill-yellow-400" />{result.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {result.discountPrice ? (
                            <>
                              <p className="text-sm text-gray-400 line-through">{formatPrice(result.price)}</p>
                              <p className="font-bold text-green-600">{formatPrice(result.discountPrice)}</p>
                            </>
                          ) : (
                            <p className="font-bold text-gray-900">{formatPrice(result.price)}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/produtos?search=${encodeURIComponent(query)}`}
                    onClick={() => { saveToHistory(query); setIsOpen(false) }}
                    className="flex items-center justify-center gap-2 p-3 mt-2 bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
                  >
                    <Zap className="w-4 h-4" />
                    Ver todos os resultados
                  </Link>
                </div>
              )}

              {/* Nenhum Resultado */}
              {!isLoading && query && results.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Nenhum produto encontrado</p>
                  <p className="text-sm text-gray-400">Tente buscar por "iPhone" ou "Apple Watch"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
