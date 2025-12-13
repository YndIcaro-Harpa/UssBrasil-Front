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

// Função para calcular parcelas (mesma lógica do checkout)
const getInstallmentValue = (total: number, installments: number) => {
  const hasInterest = installments > 10
  const extraInstallments = hasInterest ? installments - 10 : 0
  const totalInterestPercent = extraInstallments * 1.99
  const totalWithInterest = total * (1 + totalInterestPercent / 100)
  return {
    value: totalWithInterest / installments,
    total: totalWithInterest,
    hasInterest
  }
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
  
  // Calcular parcela de 10x (sem juros) e 12x (com juros)
  const installment10x = getInstallmentValue(total, 10)
  const installment12x = getInstallmentValue(total, 12)

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header Compacto */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continuar comprando
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Meu Carrinho
              </h1>
              <p className="text-gray-500 text-sm">
                {items.length === 0
                  ? 'Seu carrinho está vazio'
                  : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              Explore nossa coleção de produtos
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-all text-sm"
            >
              Explorar Produtos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Cart Content */}
        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  const displayPrice = item.discountPrice || item.price
                  const hasDiscount = item.discountPrice && item.discountPrice < item.price
                  const discountPercent = hasDiscount 
                    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100) 
                    : 0
                  const itemTotal = displayPrice * item.quantity
                  const itemStock = item.stock || 999
                  const item10x = getInstallmentValue(itemTotal, 10)

                  return (
                    <motion.div
                      key={`cart-item-${item.id || index}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4 transition-shadow hover:shadow-md"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/produto/${item.slug}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden group"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                        {hasDiscount && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            -{discountPercent}%
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/produto/${item.slug}`} className="group flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className="text-[10px] font-bold text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                                {item.brand}
                              </span>
                              {item.tag && (
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-500 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Quantity Row */}
                        <div className="mt-auto pt-2 flex items-end justify-between gap-2 flex-wrap">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                  R$ {item.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-bold text-blue-500">
                              R$ {itemTotal.toFixed(2)}
                            </span>
                            <p className="text-[11px] text-gray-500">
                              10x R$ {item10x.value.toFixed(2)} s/juros
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, itemStock)}
                              disabled={item.quantity <= 1 || loadingItems.has(item.id)}
                              className="w-7 h-7 rounded-md bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, itemStock)}
                              disabled={item.quantity >= itemStock || loadingItems.has(item.id)}
                              className="w-7 h-7 rounded-md bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary - Compacto */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Resumo
                </h2>

                {/* Items Summary - Compacto */}
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={`summary-${item.id || idx}`} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate pr-2 flex-1">
                        {item.name} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        R$ {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-3 border-t border-b border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Frete
                    </span>
                    <span className="font-semibold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded">
                      GRÁTIS
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 my-4">
                  <span>Total</span>
                  <span className="text-blue-500">R$ {total.toFixed(2)}</span>
                </div>
                
                {/* Parcelamento Info */}
                <div className="bg-gray-50 rounded-lg p-2.5 mb-4 text-xs">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">10x</span> de R$ {installment10x.value.toFixed(2)} sem juros
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    ou <span className="font-medium">12x</span> de R$ {installment12x.value.toFixed(2)} 
                    {installment12x.hasInterest && <span className="text-amber-600"> (com juros)</span>}
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Finalizar Compra
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span>Até <strong>10x sem juros</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Compra <strong>100% segura</strong></span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-4 pt-3 border-t border-gray-100">
                  Ambiente seguro • SSL
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
