'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Package,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Banknote,
  PiggyBank,
  Receipt
} from 'lucide-react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku?: string | null
  costPrice?: number | null
  price: number
  originalPrice?: number | null
  discountPrice?: number | null
  markup?: number | null
  profitMargin?: number | null
  profitValue?: number | null
  stock: number
  category?: { name: string }
  brand?: { name: string }
  colors?: string
  sizes?: string
  storage?: string
}

interface PricingConfig {
  pixDiscount: number // Desconto no PIX em %
  cardFee: number // Taxa do cartão em %
  installmentFees: { [key: number]: number } // Taxa por número de parcelas
  operationalCost: number // Custo operacional fixo por venda
  shippingMarkup: number // Markup no frete
}

const defaultConfig: PricingConfig = {
  pixDiscount: 5,
  cardFee: 4.99,
  installmentFees: {
    1: 0,
    2: 2.99,
    3: 4.49,
    4: 5.99,
    5: 7.49,
    6: 8.99,
    7: 10.49,
    8: 11.99,
    9: 13.49,
    10: 14.99,
    11: 16.49,
    12: 17.99
  },
  operationalCost: 0,
  shippingMarkup: 0
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [config, setConfig] = useState<PricingConfig>(defaultConfig)
  const [showConfig, setShowConfig] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    costPrice: number
    price: number
    discountPrice: number | undefined
  }>({ costPrice: 0, price: 0, discountPrice: undefined })

  // Calculator state
  const [calcMode, setCalcMode] = useState<'cost-to-price' | 'price-to-margin'>('cost-to-price')
  const [calcCostPrice, setCalcCostPrice] = useState<number>(0)
  const [calcDesiredMargin, setCalcDesiredMargin] = useState<number>(30)
  const [calcSalePrice, setCalcSalePrice] = useState<number>(0)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    loadConfig()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.products.getAll({ page: 1, limit: 100 })
      setProducts(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll()
      setCategories(response || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadConfig = () => {
    const saved = localStorage.getItem('pricingConfig')
    if (saved) {
      setConfig(JSON.parse(saved))
    }
  }

  const saveConfig = () => {
    localStorage.setItem('pricingConfig', JSON.stringify(config))
    toast.success('Configurações salvas!')
    setShowConfig(false)
  }

  const calculatePricing = (costPrice: number, salePrice: number) => {
    const profit = salePrice - costPrice
    const markup = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0
    return { profit, markup, margin }
  }

  const calculateFromCost = () => {
    if (calcCostPrice <= 0) return
    const desiredProfit = calcCostPrice * (calcDesiredMargin / 100)
    const price = calcCostPrice + desiredProfit
    // Ajustar para cobrir taxa do cartão
    const adjustedPrice = price / (1 - config.cardFee / 100)
    setCalcSalePrice(Math.ceil(adjustedPrice * 100) / 100)
  }

  const calculateInstallments = (price: number) => {
    const installments: { parcelas: number; valor: number; total: number; juros: number }[] = []

    for (let i = 1; i <= 12; i++) {
      const fee = config.installmentFees[i] || 0
      const totalWithFee = price * (1 + fee / 100)
      const valorParcela = totalWithFee / i

      installments.push({
        parcelas: i,
        valor: Math.ceil(valorParcela * 100) / 100,
        total: Math.ceil(totalWithFee * 100) / 100,
        juros: fee
      })
    }

    return installments
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = !filterCategory || product.category?.name === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, filterCategory])

  const totalStats = useMemo(() => {
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0
    let productsWithCost = 0

    filteredProducts.forEach(product => {
      const salePrice = product.discountPrice || product.price
      if (product.costPrice && product.costPrice > 0) {
        totalCost += product.costPrice * product.stock
        totalRevenue += salePrice * product.stock
        totalProfit += (salePrice - product.costPrice) * product.stock
        productsWithCost++
      }
    })

    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    return { totalCost, totalRevenue, totalProfit, avgMargin, productsWithCost }
  }, [filteredProducts])

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id)
    setEditValues({
      costPrice: product.costPrice || 0,
      price: product.price,
      discountPrice: product.discountPrice ?? undefined
    })
  }

  const handleSaveProduct = async (productId: string) => {
    try {
      const { profit, markup, margin } = calculatePricing(
        editValues.costPrice,
        editValues.discountPrice || editValues.price
      )

      // Update product with pricing info
      await api.products.update(productId, {
        price: editValues.price,
        discountPrice: editValues.discountPrice
      })

      toast.success('Produto atualizado!')
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
    }
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-emerald-600'
    if (margin >= 20) return 'text-blue-600'
    if (margin >= 10) return 'text-amber-600'
    return 'text-red-600'
  }

  const getMarginBg = (margin: number) => {
    if (margin >= 30) return 'bg-emerald-100 border-emerald-300'
    if (margin >= 20) return 'bg-blue-100 border-blue-300'
    if (margin >= 10) return 'bg-amber-100 border-amber-300'
    return 'bg-red-100 border-red-300'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Precificação de Produtos</h1>
          <p className="text-gray-600 text-sm">Gerencie custos, margens e preços de venda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            <span>Configurações</span>
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-[#001941] text-white rounded-xl hover:bg-[#001941]/90 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Configurações de Precificação</h3>
            <button onClick={() => setShowConfig(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto PIX (%)
              </label>
              <input
                type="number"
                value={config.pixDiscount}
                onChange={(e) => setConfig({ ...config, pixDiscount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa Cartão (%)
              </label>
              <input
                type="number"
                value={config.cardFee}
                onChange={(e) => setConfig({ ...config, cardFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Operacional (R$)
              </label>
              <input
                type="number"
                value={config.operationalCost}
                onChange={(e) => setConfig({ ...config, operationalCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={saveConfig}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxas por Parcelas (%)
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((parcela) => (
                <div key={parcela} className="text-center">
                  <span className="text-xs text-gray-500">{parcela}x</span>
                  <input
                    type="number"
                    value={config.installmentFees[parcela] || 0}
                    onChange={(e) => setConfig({
                      ...config,
                      installmentFees: {
                        ...config.installmentFees,
                        [parcela]: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600 text-sm">Custo Total Estoque</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalCost)}</p>
          <p className="text-xs text-gray-500 mt-1">{totalStats.productsWithCost} produtos com custo</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-gray-600 text-sm">Receita Potencial</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Se vender todo estoque</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">Lucro Potencial</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalStats.totalProfit)}</p>
          <p className="text-xs text-gray-500 mt-1">Margem média: {totalStats.avgMargin.toFixed(1)}%</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Percent className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-gray-600 text-sm">Margem Média</span>
          </div>
          <p className={`text-2xl font-bold ${getMarginColor(totalStats.avgMargin)}`}>
            {totalStats.avgMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalStats.avgMargin >= 30 ? 'Excelente' : totalStats.avgMargin >= 20 ? 'Boa' : totalStats.avgMargin >= 10 ? 'Regular' : 'Baixa'}
          </p>
        </motion.div>
      </div>

      {/* Calculator */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-[#001941]" />
          <h3 className="text-lg font-bold text-gray-900">Calculadora de Preços</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo (R$)
              </label>
              <input
                type="number"
                value={calcCostPrice || ''}
                onChange={(e) => setCalcCostPrice(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 2500.00"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem Desejada (%)
              </label>
              <input
                type="number"
                value={calcDesiredMargin || ''}
                onChange={(e) => setCalcDesiredMargin(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 30"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={calculateFromCost}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#001941] text-white rounded-xl hover:bg-[#001941]/90 transition-all"
            >
              <Calculator className="w-5 h-5" />
              Calcular Preço de Venda
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-gradient-to-br from-[#001941] to-blue-800 rounded-2xl p-6 text-white">
            <h4 className="text-sm font-medium text-blue-200 mb-2">Preço de Venda Sugerido</h4>
            <p className="text-4xl font-bold mb-4">{formatCurrency(calcSalePrice)}</p>

            {calcCostPrice > 0 && calcSalePrice > 0 && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Custo:</span>
                  <span>{formatCurrency(calcCostPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Lucro Bruto:</span>
                  <span className="text-emerald-300">{formatCurrency(calcSalePrice - calcCostPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Markup:</span>
                  <span>{(((calcSalePrice - calcCostPrice) / calcCostPrice) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Margem Real:</span>
                  <span>{(((calcSalePrice - calcCostPrice) / calcSalePrice) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-t border-blue-600 pt-2 mt-2">
                  <span className="text-blue-200">Preço no PIX (-{config.pixDiscount}%):</span>
                  <span className="text-emerald-300">{formatCurrency(calcSalePrice * (1 - config.pixDiscount / 100))}</span>
                </div>
              </div>
            )}
          </div>

          {/* Installments Preview */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Simulação de Parcelamento
            </h4>
            {calcSalePrice > 0 ? (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {calculateInstallments(calcSalePrice).map((inst) => (
                  <div
                    key={inst.parcelas}
                    className={`flex justify-between text-sm py-1 px-2 rounded ${
                      inst.parcelas <= 6 ? 'bg-emerald-50' : inst.parcelas <= 10 ? 'bg-amber-50' : 'bg-red-50'
                    }`}
                  >
                    <span className="text-gray-700">
                      {inst.parcelas}x de {formatCurrency(inst.valor)}
                    </span>
                    <span className={`${inst.juros > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {inst.juros > 0 ? `+${inst.juros}%` : 'Sem juros'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">
                Calcule um preço para ver os parcelamentos
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none bg-white"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Lista de Produtos ({filteredProducts.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Produto</th>
                <th className="text-right p-4 text-sm font-medium text-gray-700">Custo</th>
                <th className="text-right p-4 text-sm font-medium text-gray-700">Preço Venda</th>
                <th className="text-right p-4 text-sm font-medium text-gray-700">Preço Promo</th>
                <th className="text-right p-4 text-sm font-medium text-gray-700">Lucro</th>
                <th className="text-right p-4 text-sm font-medium text-gray-700">Margem</th>
                <th className="text-center p-4 text-sm font-medium text-gray-700">Estoque</th>
                <th className="text-center p-4 text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const salePrice = product.discountPrice || product.price
                const costPrice = product.costPrice || 0
                const profit = salePrice - costPrice
                const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0
                const isEditing = editingProduct === product.id
                const isExpanded = expandedProduct === product.id

                return (
                  <>
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {product.sku || 'Sem SKU'} • {product.category?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.costPrice}
                            onChange={(e) => setEditValues({ ...editValues, costPrice: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        ) : (
                          <span className={costPrice > 0 ? 'text-gray-900' : 'text-gray-400'}>
                            {costPrice > 0 ? formatCurrency(costPrice) : 'Não definido'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.price}
                            onChange={(e) => setEditValues({ ...editValues, price: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{formatCurrency(product.price)}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.discountPrice || ''}
                            onChange={(e) => setEditValues({ ...editValues, discountPrice: parseFloat(e.target.value) || undefined })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                            placeholder="Opcional"
                          />
                        ) : product.discountPrice ? (
                          <span className="text-emerald-600 font-medium">{formatCurrency(product.discountPrice)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className={profit > 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                          {costPrice > 0 ? formatCurrency(profit) : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {costPrice > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMarginBg(margin)} ${getMarginColor(margin)}`}>
                            {margin.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-emerald-100 text-emerald-700' :
                          product.stock > 0 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSaveProduct(product.id)}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Detalhes de Preço */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Detalhes de Preço
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Preço de Custo:</span>
                                  <span className="font-medium">{costPrice > 0 ? formatCurrency(costPrice) : 'Não definido'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Preço Original:</span>
                                  <span className="font-medium">{formatCurrency(product.price)}</span>
                                </div>
                                {product.discountPrice && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Preço Promocional:</span>
                                    <span className="font-medium text-emerald-600">{formatCurrency(product.discountPrice)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-gray-600">Preço no PIX:</span>
                                  <span className="font-medium text-blue-600">
                                    {formatCurrency(salePrice * (1 - config.pixDiscount / 100))}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Análise de Lucro */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <PiggyBank className="w-4 h-4" />
                                Análise de Lucro
                              </h4>
                              {costPrice > 0 ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Lucro Bruto:</span>
                                    <span className={`font-medium ${profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {formatCurrency(profit)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Margem:</span>
                                    <span className={`font-medium ${getMarginColor(margin)}`}>{margin.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Markup:</span>
                                    <span className="font-medium">
                                      {costPrice > 0 ? `${(((salePrice - costPrice) / costPrice) * 100).toFixed(1)}%` : '-'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Lucro Total (Estoque):</span>
                                    <span className="font-medium text-emerald-600">
                                      {formatCurrency(profit * product.stock)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">Defina o preço de custo para ver a análise</p>
                              )}
                            </div>

                            {/* Parcelamento */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Parcelamento
                              </h4>
                              <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                {calculateInstallments(salePrice).slice(0, 6).map((inst) => (
                                  <div key={inst.parcelas} className="flex justify-between">
                                    <span className="text-gray-600">{inst.parcelas}x de {formatCurrency(inst.valor)}</span>
                                    <span className={inst.juros > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                      {inst.juros > 0 ? `+${inst.juros}%` : 'Sem juros'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Variações */}
                          {(product.colors || product.sizes || product.storage) && (
                            <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3">Variações do Produto</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {product.colors && (
                                  <div>
                                    <span className="text-sm text-gray-600">Cores:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {JSON.parse(product.colors).map((color: any, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                          {typeof color === 'string' ? color : color.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {product.sizes && (
                                  <div>
                                    <span className="text-sm text-gray-600">Tamanhos:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {JSON.parse(product.sizes).map((size: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                          {size}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {product.storage && (
                                  <div>
                                    <span className="text-sm text-gray-600">Armazenamento:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {JSON.parse(product.storage).map((storage: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                          {storage}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
