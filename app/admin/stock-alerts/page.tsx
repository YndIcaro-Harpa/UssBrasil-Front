'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Package, Bell, RefreshCw, ArrowUp, ArrowDown, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FadeInUp, AnimatedCard } from '@/components/admin/PageTransition'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'react-hot-toast'

interface Product {
  id: number
  name: string
  sku?: string
  stock: number
  price: number
  categoryId?: number
  category?: { name: string }
  images?: string[]
}

interface StockAlert {
  product: Product
  level: 'critical' | 'low' | 'medium'
  threshold: number
}

// Stock thresholds
const STOCK_THRESHOLDS = {
  critical: 5,
  low: 15,
  medium: 30
}

export default function StockAlertsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'medium'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'stock' | 'name'>('stock')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      const productList = Array.isArray(data) ? data : data.products || []
      setProducts(productList)
      
      // Calculate alerts
      const stockAlerts: StockAlert[] = []
      productList.forEach((product: Product) => {
        if (product.stock <= STOCK_THRESHOLDS.critical) {
          stockAlerts.push({ product, level: 'critical', threshold: STOCK_THRESHOLDS.critical })
        } else if (product.stock <= STOCK_THRESHOLDS.low) {
          stockAlerts.push({ product, level: 'low', threshold: STOCK_THRESHOLDS.low })
        } else if (product.stock <= STOCK_THRESHOLDS.medium) {
          stockAlerts.push({ product, level: 'medium', threshold: STOCK_THRESHOLDS.medium })
        }
      })
      
      setAlerts(stockAlerts)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      })
      
      if (!response.ok) throw new Error('Failed to update stock')
      
      toast.success('Estoque atualizado com sucesso!')
      fetchProducts()
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Erro ao atualizar estoque')
    }
  }

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || alert.level === filter)
    .filter(alert => 
      alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'stock') {
        return sortOrder === 'asc' 
          ? a.product.stock - b.product.stock 
          : b.product.stock - a.product.stock
      } else {
        return sortOrder === 'asc'
          ? a.product.name.localeCompare(b.product.name)
          : b.product.name.localeCompare(a.product.name)
      }
    })

  // Stats
  const stats = {
    critical: alerts.filter(a => a.level === 'critical').length,
    low: alerts.filter(a => a.level === 'low').length,
    medium: alerts.filter(a => a.level === 'medium').length,
    outOfStock: products.filter(p => p.stock === 0).length
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical': return 'Crítico'
      case 'low': return 'Baixo'
      case 'medium': return 'Médio'
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#001941]" />
              Alertas de Estoque
            </h1>
            <p className="text-gray-500">Monitore produtos com estoque baixo</p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#001941] hover:bg-[#023a58]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </FadeInUp>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={0.1}>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Estoque Crítico</p>
                  <p className="text-3xl font-bold text-red-700">{stats.critical}</p>
                  <p className="text-xs text-red-500">≤ {STOCK_THRESHOLDS.critical} unidades</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Estoque Baixo</p>
                  <p className="text-3xl font-bold text-orange-700">{stats.low}</p>
                  <p className="text-xs text-orange-500">≤ {STOCK_THRESHOLDS.low} unidades</p>
                </div>
                <Package className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Estoque Médio</p>
                  <p className="text-3xl font-bold text-yellow-700">{stats.medium}</p>
                  <p className="text-xs text-yellow-500">≤ {STOCK_THRESHOLDS.medium} unidades</p>
                </div>
                <Package className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                  <p className="text-3xl font-bold text-gray-700">{stats.outOfStock}</p>
                  <p className="text-xs text-gray-500">0 unidades</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Filters */}
      <FadeInUp delay={0.2}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-[#001941]' : ''}
                >
                  Todos ({alerts.length})
                </Button>
                <Button
                  variant={filter === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('critical')}
                  className={filter === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200'}
                >
                  Crítico ({stats.critical})
                </Button>
                <Button
                  variant={filter === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('low')}
                  className={filter === 'low' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 border-orange-200'}
                >
                  Baixo ({stats.low})
                </Button>
                <Button
                  variant={filter === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('medium')}
                  className={filter === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-yellow-600 border-yellow-200'}
                >
                  Médio ({stats.medium})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>

      {/* Alerts Table */}
      <FadeInUp delay={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos com Estoque Baixo</CardTitle>
                <CardDescription>
                  {filteredAlerts.length} produto(s) precisam de atenção
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'stock') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('stock')
                      setSortOrder('asc')
                    }
                  }}
                  className={sortBy === 'stock' ? 'bg-gray-100' : ''}
                >
                  Estoque
                  {sortBy === 'stock' && (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('name')
                      setSortOrder('asc')
                    }
                  }}
                  className={sortBy === 'name' ? 'bg-gray-100' : ''}
                >
                  Nome
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {alerts.length === 0 
                    ? 'Nenhum produto com estoque baixo! 🎉' 
                    : 'Nenhum alerta encontrado com os filtros aplicados'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Estoque</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Nível</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert, index) => (
                      <tr 
                        key={alert.product.id} 
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          alert.level === 'critical' ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {alert.product.images?.[0] ? (
                                <img 
                                  src={alert.product.images[0]} 
                                  alt={alert.product.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{alert.product.name}</p>
                              <p className="text-sm text-gray-500">R$ {alert.product.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {alert.product.sku || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {alert.product.category?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${
                            alert.level === 'critical' ? 'text-red-600' :
                            alert.level === 'low' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`}>
                            {alert.product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getLevelColor(alert.level)}>
                            {getLevelText(alert.level)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              defaultValue={alert.product.stock}
                              className="w-20 text-center"
                              onBlur={(e) => {
                                const newValue = parseInt(e.target.value)
                                if (!isNaN(newValue) && newValue !== alert.product.stock) {
                                  handleUpdateStock(alert.product.id, newValue)
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const newValue = parseInt((e.target as HTMLInputElement).value)
                                  if (!isNaN(newValue) && newValue !== alert.product.stock) {
                                    handleUpdateStock(alert.product.id, newValue)
                                  }
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStock(alert.product.id, alert.product.stock + 10)}
                              title="Adicionar 10 unidades"
                            >
                              +10
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>

      {/* Quick Actions */}
      <FadeInUp delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  const csv = [
                    ['ID', 'Nome', 'SKU', 'Estoque', 'Nível'].join(','),
                    ...alerts.map(a => [
                      a.product.id,
                      `"${a.product.name}"`,
                      a.product.sku || '',
                      a.product.stock,
                      a.level
                    ].join(','))
                  ].join('\n')
                  
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `alertas-estoque-${new Date().toISOString().split('T')[0]}.csv`
                  link.click()
                  toast.success('Relatório exportado!')
                }}
              >
                <Package className="h-6 w-6 text-[#001941]" />
                <span>Exportar Relatório</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  if (stats.critical > 0) {
                    toast.error(`ATENÇÃO: ${stats.critical} produtos com estoque crítico!`, { duration: 5000 })
                  } else if (stats.low > 0) {
                    toast(`${stats.low} produtos com estoque baixo`, { icon: '⚠️' })
                  } else {
                    toast.success('Todos os estoques estão OK!')
                  }
                }}
              >
                <Bell className="h-6 w-6 text-[#001941]" />
                <span>Verificar Alertas</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  window.location.href = '/admin/products'
                }}
              >
                <Filter className="h-6 w-6 text-[#001941]" />
                <span>Gerenciar Produtos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>
    </div>
  )
}

