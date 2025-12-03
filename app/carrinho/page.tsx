'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Shield, Truck, CreditCard, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'

// Tipo para item do carrinho com stock opcional
interface CartItemWithStock {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  stock?: number;
  slug?: string;
  brand?: string;
  category?: string;
  tag?: string;
  shortDescription?: string;
  [key: string]: any;
}

export default function CarrinhoPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  // Cast cartItems para incluir stock
  const items = cartItems as CartItemWithStock[]

  const handleUpdateQuantity = (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity < 1) {
      toast.error('Quantidade mínima é 1')
      return
    }
    if (newQuantity > stock) {
      toast.error(`Apenas ${stock} unidades disponíveis`)
      return
    }
    setLoadingItems((prev) => new Set(prev).add(productId))
    try {
      updateQuantity(productId, newQuantity)
      toast.success('Quantidade atualizada')
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
      toast.error('Erro ao atualizar quantidade')
    } finally {
      setTimeout(() => {
        setLoadingItems((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }, 300)
    }
  }

  const handleRemove = (productId: string) => {
    try {
      removeFromCart(productId)
      toast.success('Produto removido do carrinho')
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      toast.error('Erro ao remover produto')
    }
  }

  const subtotal = cartTotal
  const shipping = items.length > 0 ? 0 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-500 font-medium transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Continuar comprando
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Meu Carrinho
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                {items.length === 0
                  ? 'Seu carrinho está vazio'
                  : `${items.length} ${items.length === 1 ? 'item' : 'itens'} no carrinho`}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-14 h-14 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Explore nossa coleção de produtos e encontre os melhores dispositivos para você
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 bg-blue-400 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all duration-300"
            >
              Explorar Produtos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}

        {/* Cart Content */}
        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  const displayPrice = item.discountPrice || item.price
                  const hasDiscount = item.discountPrice && item.discountPrice < item.price
                  const discountPercent = hasDiscount 
                    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100) 
                    : 0
                  const itemTotal = displayPrice * item.quantity
                  const itemStock = item.stock || 999

                  return (
                    <motion.div
                      key={`cart-item-${item.id || index}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-5 sm:p-6 flex gap-5 transition-shadow duration-300"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/produto/${item.slug}`}
                        className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden group"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            -{discountPercent}%
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link href={`/produto/${item.slug}`} className="group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                              {item.brand}
                            </span>
                            {item.tag && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Tag className="w-3 h-3" />
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>

                        {/* Short Description */}
                        {item.shortDescription && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1 hidden sm:block">
                            {item.shortDescription}
                          </p>
                        )}

                        {/* Category */}
                        {item.category && (
                          <span className="text-xs text-gray-400 mt-1">
                            Categoria: {item.category}
                          </span>
                        )}

                        {/* Price */}
                        <div className="mt-auto pt-3">
                          <div className="flex items-baseline gap-2">
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through font-medium">
                                R$ {item.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-lg font-bold text-gray-700">
                              R$ {displayPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400">un.</span>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl sm:text-2xl font-extrabold text-blue-400">
                              R$ {itemTotal.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">total</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ou 12x de R$ {(itemTotal / 12).toFixed(2)} sem juros
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">Qtd:</span>
                            <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, itemStock)}
                                disabled={item.quantity <= 1 || loadingItems.has(item.id)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm border border-gray-200 disabled:hover:bg-white"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-10 text-center font-bold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, itemStock)}
                                disabled={item.quantity >= itemStock || loadingItems.has(item.id)}
                                className="w-8 h-8 rounded-full bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm border border-gray-200 disabled:hover:bg-white"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            {item.stock && item.stock < 100 && (
                              <span className={`text-xs ${item.quantity >= itemStock ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                ({itemStock} disponíveis)
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28"
              >
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                  Resumo do Pedido
                </h2>

                {/* Items Summary */}
                <div className="space-y-3 mb-6">
                  {items.map((item, idx) => (
                    <div key={`summary-${item.id || idx}`} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2 flex-1">
                        {item.name} <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        R$ {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-4 border-t border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-gray-800">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Frete
                    </span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-sm">
                      GRÁTIS
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-extrabold text-gray-900 my-6">
                  <span>Total</span>
                  <span className="text-blue-400">R$ {total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-blue-400 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Finalizar Compra
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span>Parcelamento em até <strong className="text-gray-700">12x sem juros</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>Compra <strong className="text-gray-700">100% segura</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Truck className="w-5 h-5 text-amber-500" />
                    <span>Entrega <strong className="text-gray-700">rápida e rastreável</strong></span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">
                    Ambiente seguro • Dados criptografados • USS Brasil
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
