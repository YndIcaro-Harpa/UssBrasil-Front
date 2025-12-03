'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, Settings, User, Menu, Sun, Moon } from 'lucide-react'
import { api } from '@/services/api'

interface AdminHeaderProps {
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export default function AdminHeader({ sidebarCollapsed = false, onToggleSidebar }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, message: 'Bem-vindo ao painel admin', time: 'Agora', unread: false }
  ])
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch pending orders as notifications
        const response = await api.orders.getAll({ status: 'PENDING', limit: 5 })
        // The API returns { data: Order[], ... } but typed as any in some places, checking both
        const orders = (response as any).data || (response as any).orders || []
        
        if (orders.length > 0) {
          const orderNotifications = orders.map((order: any) => ({
            id: `order-${order.id}`,
            message: `Novo pedido #${order.number || order.id.slice(0, 8)} - R$ ${order.total}`,
            time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            type: 'order'
          }))
          
          setNotifications(prev => {
            // Merge keeping unique IDs
            const existingIds = new Set(prev.map(n => n.id))
            const newNotifs = orderNotifications.filter((n: any) => !existingIds.has(n.id))
            return [...newNotifs, ...prev]
          })
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      }
    }

    fetchNotifications()
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <motion.header
      initial={false}
      animate={{ 
        marginLeft: sidebarCollapsed ? 80 : 288 
      }}
      className="bg-white border-b border-gray-200 
                 h-16 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-6 shadow-sm"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-[#001941] hover:bg-blue-50 
                   transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:block">
          <h1 className="text-[#001941] font-semibold text-lg">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Bem-vindo de volta, Admin!
          </p>
        </div>
      </div>

      {/* Center - Search (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar produtos, pedidos, clientes..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                     text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#001941] 
                     focus:ring-2 focus:ring-blue-400/20 transition-all text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button className="p-2 rounded-lg text-gray-500 hover:text-[#001941] hover:bg-blue-50 
                         transition-colors" 
                title="Alternar tema">
          <Sun className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-[#001941] hover:bg-blue-50 
                     transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs 
                             rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-80 bg-white 
                       border border-gray-200 rounded-xl shadow-xl py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-[#001941] font-medium">Notificações</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer
                              ${notification.unread ? 'bg-blue-50/50' : ''}`}
                  >
                    <p className={`text-sm ${notification.unread ? 'text-[#001941]' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-blue-600 text-sm hover:text-[#001941] transition-colors">
                  Ver todas as notificações
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg text-gray-500 hover:text-[#001941] hover:bg-blue-50 
                         transition-colors" 
                title="Configurações">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-2 rounded-lg text-gray-500 hover:text-[#001941] 
                     hover:bg-blue-50 transition-colors"
          >
            <div className="w-8 h-8 bg-[#001941] rounded-full 
                          flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[#001941] text-sm font-medium">Admin</p>
              <p className="text-gray-500 text-xs">Administrador</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-48 bg-white 
                       border border-gray-200 rounded-xl shadow-xl py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-[#001941] font-medium">Admin User</p>
                <p className="text-gray-500 text-sm">admin@ussbrasil.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:text-[#001941] 
                                 hover:bg-blue-50 transition-colors">
                  Meu Perfil
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:text-[#001941] 
                                 hover:bg-blue-50 transition-colors">
                  Configurações
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:text-[#001941] 
                                 hover:bg-blue-50 transition-colors">
                  Ajuda
                </button>
              </div>
              <div className="border-t border-gray-200 py-1">
                <button className="w-full px-4 py-2 text-left text-red-500 hover:text-red-600 
                                 hover:bg-red-50 transition-colors">
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

