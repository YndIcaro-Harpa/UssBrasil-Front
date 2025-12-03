'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, X, ShoppingCart, Heart, Check, Minus, Scale, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useComparisonStore } from '@/store/comparisonStore'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ComparacaoPage() {
  const { items, removeFromComparison, clearComparison } = useComparisonStore()
  const { addToCart } = useCart()
  const { favorites, toggleFavorite } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get all unique specification keys from all products
  const allSpecKeys = new Set<string>()
  items.forEach(item => {
    if (item.specifications) {
      Object.keys(item.specifications).forEach(key => allSpecKeys.add(key))
    }
  })

  // Common comparison attributes
  const comparisonAttributes: { key: string; label: string; format: (v: any) => string }[] = [
    { key: 'price', label: 'Preço', format: (v: number) => `R$ ${v?.toFixed(2) || '-'}` },
    { key: 'discountPrice', label: 'Preço com Desconto', format: (v: number | null) => v ? `R$ ${v.toFixed(2)}` : '-' },
    { key: 'brand', label: 'Marca', format: (v: string) => v || '-' },
    { key: 'category', label: 'Categoria', format: (v: string) => v || '-' },
    { key: 'stock', label: 'Estoque', format: (v: number) => v !== undefined ? (v > 0 ? `${v} unidades` : 'Indisponível') : '-' },
    { key: 'rating', label: 'Avaliação', format: (v: number) => v ? `${v.toFixed(1)} ⭐` : '-' },
    { key: 'reviews', label: 'Avaliações', format: (v: number) => v ? `${v} avaliações` : '-' },
  ]

  const handleAddToCart = (product: any) => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Produto indisponível')
      return
    }
    addToCart(product)
    toast.success('Adicionado ao carrinho!')
  }

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId)
    toast.success(favorites.includes(productId) ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-[#034a6e] hover:text-[#023a58] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para produtos
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-[#034a6e]" />
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
                Comparar Produtos
              </h1>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={clearComparison}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Comparação
              </Button>
            )}
          </div>
          <p className="text-gray-500 mt-2">
            {items.length === 0 
              ? 'Adicione produtos para comparar' 
              : `Comparando ${items.length} produto${items.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Scale className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Nenhum produto para comparar
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Navegue pelos produtos e clique no ícone de comparação para adicionar itens aqui.
            </p>
            <Link href="/produtos">
              <Button className="bg-[#034a6e] hover:bg-[#023a58]">
                Ver Produtos
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            {/* Comparison Table */}
            <div className="min-w-max">
              {/* Product Headers */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(200px, 1fr))` }}>
                <div className="p-4 bg-[#034a6e] rounded-tl-xl text-white font-semibold">
                  Produto
                </div>
                <AnimatePresence mode="popLayout">
                  {items.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 bg-white border rounded-t-xl ${index === items.length - 1 ? 'rounded-tr-xl' : ''}`}
                    >
                      <div className="relative">
                        <button
                          onClick={() => removeFromComparison(product.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          <Image
                            src={product.image || product.images?.[0] || '/images/placeholders/product-placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                            unoptimized
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3">
                          {product.name}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-[#54c4cf] hover:bg-[#3fb0bb] text-white"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Comprar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFavorite(String(product.id))}
                            className={favorites.includes(String(product.id)) ? 'text-red-500 border-red-200' : ''}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(String(product.id)) ? 'fill-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Comparison Rows */}
              {comparisonAttributes.map((attr, rowIndex) => (
                <div 
                  key={attr.key}
                  className={`grid gap-4 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(200px, 1fr))` }}
                >
                  <div className="p-4 font-medium text-gray-700 border-l border-gray-200">
                    {attr.label}
                  </div>
                  {items.map((product) => {
                    const value = product[attr.key]
                    const formattedValue = attr.format(value)
                    
                    // Highlight best price
                    const isBestPrice = attr.key === 'price' && 
                      items.length > 1 &&
                      product.price === Math.min(...items.map(i => i.price))
                    
                    return (
                      <div 
                        key={product.id}
                        className={`p-4 text-center border-r border-gray-200 ${
                          isBestPrice ? 'bg-green-50 font-bold text-green-700' : ''
                        }`}
                      >
                        {formattedValue}
                        {isBestPrice && (
                          <Badge className="ml-2 bg-green-500 text-white">
                            Melhor preço
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Specifications Section */}
              {allSpecKeys.size > 0 && (
                <>
                  <div 
                    className="grid gap-4 bg-[#034a6e] text-white"
                    style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(200px, 1fr))` }}
                  >
                    <div className="p-4 font-semibold">
                      Especificações
                    </div>
                    {items.map((product) => (
                      <div key={product.id} className="p-4 text-center">
                        -
                      </div>
                    ))}
                  </div>
                  
                  {Array.from(allSpecKeys).map((specKey, rowIndex) => (
                    <div 
                      key={specKey}
                      className={`grid gap-4 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                      style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(200px, 1fr))` }}
                    >
                      <div className="p-4 font-medium text-gray-700 border-l border-gray-200">
                        {specKey}
                      </div>
                      {items.map((product) => (
                        <div 
                          key={product.id}
                          className="p-4 text-center border-r border-gray-200"
                        >
                          {product.specifications?.[specKey] ? (
                            <span className="text-gray-900">
                              {product.specifications[specKey]}
                              <Check className="w-4 h-4 inline ml-1 text-green-500" />
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              <Minus className="w-4 h-4 inline" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Add more products prompt */}
        {items.length > 0 && items.length < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-blue-50 rounded-xl text-center"
          >
            <p className="text-blue-700 mb-4">
              Você pode adicionar até {4 - items.length} produto{4 - items.length > 1 ? 's' : ''} mais para comparar
            </p>
            <Link href="/produtos">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Adicionar Mais Produtos
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
