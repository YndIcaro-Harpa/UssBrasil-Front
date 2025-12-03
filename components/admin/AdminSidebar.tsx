'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  TrendingUp,
  Bell,
  User,
  Menu,
  X,
  Home,
  LogOut,
  Search,
  Plus,
  ChevronLeft,
  HelpCircle,
  UserPlus,
  Calculator
} from 'lucide-react'
import AdminNavigation from './AdminNavigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import api from '@/services/api'

interface AdminSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onQuickAction?: (action: string) => void
}

interface BadgeCounts {
  products: number
  pendingOrders: number
  customers: number
}

const getNavigation = (counts: BadgeCounts) => [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: BarChart3,
    description: 'Visão geral e métricas'
  },
  { 
    name: 'Produtos', 
    href: '/admin/products', 
    icon: Package,
    description: 'Gerenciar catálogo',
    badge: counts.products > 0 ? counts.products.toString() : undefined
  },
  { 
    name: 'Precificação', 
    href: '/admin/pricing', 
    icon: Calculator,
    description: 'Custos e margens'
  },
  { 
    name: 'Pedidos', 
    href: '/admin/orders', 
    icon: ShoppingCart,
    description: 'Processar vendas',
    badge: counts.pendingOrders > 0 ? counts.pendingOrders.toString() : undefined,
    badgeColor: counts.pendingOrders > 0 ? 'warning' as const : undefined
  },
  { 
    name: 'Clientes', 
    href: '/admin/customers', 
    icon: Users,
    description: 'Base de usuários',
    badge: counts.customers > 0 ? counts.customers.toString() : undefined
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: TrendingUp,
    description: 'Relatórios e insights'
  },
  { 
    name: 'Relatórios', 
    href: '/admin/reports', 
    icon: FileText,
    description: 'Documentos e dados'
  },
  { 
    name: 'Configurações', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'Preferências do sistema'
  }
]

const quickActions = [
  { name: 'Novo Produto', icon: Plus, action: 'new-product' },
  { name: 'Novo Pedido', icon: ShoppingCart, action: 'new-order' },
  { name: 'Novo Cliente', icon: UserPlus, action: 'new-customer' },
  { name: 'Relatório', icon: FileText, action: 'new-report' }
]

export default function AdminSidebar({ collapsed = false, onToggleCollapse, onQuickAction }: AdminSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAdminAuth()
  const [counts, setCounts] = useState<BadgeCounts>({ products: 0, pendingOrders: 0, customers: 0 })

  // Fetch real counts from API
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch products count
        let productsCount = 0
        let pendingOrdersCount = 0
        let customersCount = 0

        try {
          const productsRes = await api.products.getAll({ limit: 1 })
          productsCount = productsRes?.total || 0
        } catch { /* ignore */ }

        try {
          const ordersRes = await api.orders.getAll({ status: 'pending' })
          pendingOrdersCount = ordersRes?.data?.length || 0
        } catch { /* ignore */ }

        try {
          const customersRes = await api.users.getCustomers({ limit: 1 })
          customersCount = customersRes?.pagination?.total || 0
        } catch { /* ignore */ }

        setCounts({
          products: productsCount,
          pendingOrders: pendingOrdersCount,
          customers: customersCount
        })
      } catch (error) {
        console.error('Error fetching sidebar counts:', error)
      }
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigation = getNavigation(counts)

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      className="bg-[#001941] 
                 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-lg"
    >
      {/* Header */}
      <div className="p-6 border-b border-blue-900/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src="/Empresa/02.png" 
                  alt="USS Brasil" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">USS BRASIL</h1>
                <p className="text-blue-300 text-xs">Admin Panel</p>
              </div>
            </Link>
          )}
          
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                     transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Buscar no admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-blue-900/50 border border-blue-700 rounded-xl 
                         text-white placeholder-blue-400 focus:outline-none focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto">
        <AdminNavigation items={navigation} collapsed={collapsed} />
        
        {/* Quick Actions */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 px-4"
          >
            <h3 className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-3">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center w-full px-3 py-2 text-sm text-blue-200 rounded-lg
                           hover:text-white hover:bg-blue-800 transition-colors"
                >
                  <action.icon className="w-4 h-4 mr-3" />
                  {action.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* User Profile & Footer */}
      <div className="p-4 border-t border-blue-900/50">
        {!collapsed ? (
          <div className="space-y-3">
            {/* User Profile */}
            <div className="flex items-center px-3 py-2 rounded-lg bg-blue-900/50">
              <div className="w-8 h-8 bg-blue-500 rounded-full 
                            flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin User'}</p>
                <p className="text-blue-300 text-xs truncate">{user?.email || 'admin@ussbrasil.com'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Notificações">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Ajuda">
                <HelpCircle className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Configurações">
                <Settings className="w-4 h-4" />
              </button>
              <Link
                href="/"
                className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                         transition-colors" 
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full 
                          flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <button className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Notificações">
                <Bell className="w-4 h-4" />
              </button>
              <Link
                href="/"
                className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                         transition-colors" 
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

