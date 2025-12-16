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
  Calculator,
  Layout
} from 'lucide-react'
import AdminNavigation from './AdminNavigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAuth } from '@/contexts/AuthContext'
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
    name: 'CMS Home', 
    href: '/admin/cms', 
    icon: Layout,
    description: 'Editar página inicial'
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
  const { logout } = useAuth()
  const [counts, setCounts] = useState<BadgeCounts>({ products: 0, pendingOrders: 0, customers: 0 })

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect to home page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

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
      className="bg-gray-900 text-white 
                 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-lg"
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-900/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src="/Empresa/02.png" 
                  alt="USS Brasil" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">USS BRASIL</h1>
                <p className="text-blue-300 text-[9px]">Admin Panel</p>
              </div>
            </Link>
          )}
          
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                     transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-blue-400" />
              <input
                type="text"
                placeholder="Buscar no admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-blue-900/50 border border-blue-700 rounded-lg 
                         text-white placeholder-blue-400 focus:outline-none focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/20 transition-all text-xs"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <AdminNavigation items={navigation} collapsed={collapsed} />
        
        {/* Quick Actions */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 px-3"
          >
            <h3 className="text-blue-400 text-[9px] font-medium uppercase tracking-wider mb-2">
              Ações Rápidas
            </h3>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center w-full px-2.5 py-1.5 text-[10px] text-blue-200 rounded-lg
                           hover:text-white hover:bg-blue-800 transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5 mr-2" />
                  {action.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* User Profile & Footer */}
      <div className="p-3 border-t border-blue-900/50">
        {!collapsed ? (
          <div className="space-y-2">
            {/* User Profile */}
            <div className="flex items-center px-2 py-1.5 rounded-lg bg-blue-900/50">
              <div className="w-6 h-6 bg-blue-500 rounded-full 
                            flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="ml-2 flex-1 overflow-hidden">
                <p className="text-white text-[10px] font-medium truncate">{user?.name || 'Admin User'}</p>
                <p className="text-blue-300 text-[9px] truncate">{user?.email || 'admin@ussbrasil.com'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Notificações">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Ajuda">
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Configurações">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                         transition-colors" 
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full 
                          flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <div className="flex flex-col items-center space-y-1">
              <button className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                               transition-colors" title="Notificações">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 
                         transition-colors" 
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}


