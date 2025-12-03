'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  BellOff,
  Package, 
  Tag, 
  Mail, 
  Smartphone,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'promo' | 'system' | 'alert'
  read: boolean
  createdAt: string
}

interface NotificationSettings {
  emailOrders: boolean
  emailPromos: boolean
  pushOrders: boolean
  pushPromos: boolean
}

interface ProfileNotificationsProps {
  onUnreadCountChange: (count: number) => void
}

const notificationIcons = {
  order: Package,
  promo: Tag,
  system: Bell,
  alert: AlertCircle,
}

const notificationColors = {
  order: 'bg-blue-100 text-blue-600',
  promo: 'bg-green-100 text-green-600',
  system: 'bg-gray-100 text-gray-600',
  alert: 'bg-red-100 text-red-600',
}

export default function ProfileNotifications({ onUnreadCountChange }: ProfileNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Pedido Enviado',
      message: 'Seu pedido #12345 foi enviado e está a caminho!',
      type: 'order',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Promoção Especial',
      message: 'Aproveite 20% de desconto em todos os produtos Apple!',
      type: 'promo',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      title: 'Bem-vindo à USS Brasil',
      message: 'Sua conta foi criada com sucesso. Explore nossos produtos!',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    emailOrders: true,
    emailPromos: true,
    pushOrders: true,
    pushPromos: false
  })

  // Update unread count
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length
    onUnreadCountChange(unreadCount)
  }, [notifications, onUnreadCountChange])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Todas as notificações marcadas como lidas')
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notificação removida')
  }

  const handleClearAll = () => {
    if (!confirm('Deseja remover todas as notificações?')) return
    setNotifications([])
    toast.success('Todas as notificações foram removidas')
  }

  const handleSettingChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success('Preferência atualizada')
  }

  const formatDate = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diff = now.getTime() - notificationDate.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `Há ${minutes} min`
    if (hours < 24) return `Há ${hours}h`
    if (days < 7) return `Há ${days} dias`
    return notificationDate.toLocaleDateString('pt-BR')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`
              : 'Todas as notificações lidas'
            }
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma notificação
          </h3>
          <p className="text-gray-500">
            Você será notificado sobre atualizações importantes
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type]
            const colorClass = notificationColors[notification.type]

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border transition-all ${
                  notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Marcar como lida"
                          >
                            <CheckCircle className="h-4 w-4 text-gray-400 hover:text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Notification Settings */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Preferências de Notificação
        </h3>

        <div className="space-y-6">
          {/* Email Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Email</h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Atualizações de Pedidos</p>
                  <p className="text-sm text-gray-500">Receba emails sobre status dos seus pedidos</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailOrders}
                  onChange={() => handleSettingChange('emailOrders')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Ofertas e Promoções</p>
                  <p className="text-sm text-gray-500">Receba ofertas exclusivas por email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailPromos}
                  onChange={() => handleSettingChange('emailPromos')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>

          {/* Push Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Push</h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Atualizações de Pedidos</p>
                  <p className="text-sm text-gray-500">Notificações push sobre seus pedidos</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushOrders}
                  onChange={() => handleSettingChange('pushOrders')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Ofertas e Promoções</p>
                  <p className="text-sm text-gray-500">Notificações push de ofertas</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushPromos}
                  onChange={() => handleSettingChange('pushPromos')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
