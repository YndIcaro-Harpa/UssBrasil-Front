'use client'

import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Bell, 
  Shield,
  LogOut,
  ChevronRight,
  Camera,
  Phone,
  Loader2,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { api, User as UserType, Order } from '@/services/api'

// Dynamic imports for code splitting
import dynamic from 'next/dynamic'
import type { Session } from 'next-auth'

const ProfileInfo = dynamic(() => import('./components/ProfileInfo').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{ user: UserType | null; onUpdate: (data: Partial<UserType>) => Promise<void>; session: Session }>
const ProfileOrders = dynamic(() => import('./components/ProfileOrders').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{ userId: string; initialOrders: Order[] }>
const ProfileAddresses = dynamic(() => import('./components/ProfileAddresses').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{ userId: string }>
const ProfileFavorites = dynamic(() => import('./components/ProfileFavorites').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{}>
const ProfileSecurity = dynamic(() => import('./components/ProfileSecurity').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{ userId: string; session: Session }>
const ProfileNotifications = dynamic(() => import('./components/ProfileNotifications').then(mod => mod.default), {
  loading: () => <div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
}) as React.ComponentType<{ onUnreadCountChange: (count: number) => void }>

type TabType = 'info' | 'orders' | 'addresses' | 'favorites' | 'security' | 'notifications'

interface TabConfig {
  id: TabType
  label: string
  icon: React.ElementType
  badge?: number
}

function PerfilContent() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [userData, setUserData] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersCount, setOrdersCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [hasFetched, setHasFetched] = useState(false)

  // Set active tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType
    if (tab && ['info', 'orders', 'addresses', 'favorites', 'security', 'notifications'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Faça login para acessar seu perfil')
      router.push('/')
    }
  }, [status, router])

  // Fetch user data - apenas uma vez
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id || hasFetched) return
      
      try {
        setLoading(true)
        setHasFetched(true)
        
        const [user, ordersResponse] = await Promise.all([
          api.users.getById(session.user.id).catch(() => null),
          api.orders.getByUser(session.user.id, { limit: 5 }).catch(() => ({ data: [], total: 0 }))
        ])
        
        if (user) {
          setUserData(user)
        } else {
          // Use session data as fallback
          setUserData({
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            role: (session.user.role as 'USER' | 'ADMIN') || 'USER',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
        
        setOrders(ordersResponse.data || [])
        setOrdersCount(ordersResponse.total || 0)
      } catch (error) {
        console.error('[Perfil] Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id && status === 'authenticated') {
      fetchUserData()
    }
  }, [session?.user?.id, status, hasFetched])

  // Update tab in URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/perfil?tab=${tab}`, { scroll: false })
  }

  // Handle user update
  const handleUserUpdate = async (data: Partial<UserType>) => {
    if (!userData?.id) return
    
    try {
      const token = (session as any)?.accessToken
      const updated = await api.users.update(userData.id, data, token)
      setUserData(updated)
      toast.success('Perfil atualizado com sucesso!')
      
      // Update session if name changed
      if (data.name) {
        await updateSession({ name: data.name })
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
      throw error
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
    toast.success('Logout realizado com sucesso')
  }

  const tabs: TabConfig[] = [
    { id: 'info', label: 'Meus Dados', icon: User },
    { id: 'orders', label: 'Pedidos', icon: Package, badge: ordersCount },
    { id: 'addresses', label: 'Endereços', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell, badge: unreadNotifications },
  ]

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {userData?.image ? (
                  <Image
                    src={userData.image}
                    alt={userData.name || 'Avatar'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  userData?.name?.charAt(0).toUpperCase() || session.user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <button 
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors shadow-lg"
                onClick={() => toast.info('Upload de foto em breve!')}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {userData?.name || session.user.name}
              </h1>
              <p className="text-gray-600 mb-1">
                {userData?.email || session.user.email}
              </p>
              {userData?.phone && (
                <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
                  <Phone className="h-3 w-3" />
                  {userData.phone}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Membro desde {new Date(userData?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Admin Panel Button - Only for admins */}
              {(userData?.role === 'ADMIN' || userData?.role === 'admin' || session?.user?.email === 'admin@ussbrasil.com') && (
                <Link href="/admin">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#001941] hover:bg-blue-900 text-white rounded-lg transition-colors text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    Painel Admin
                  </button>
                </Link>
              )}
              <Link href="/meus-pedidos">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700">
                  <Package className="h-4 w-4" />
                  Meus Pedidos
                </button>
              </Link>
              <Link href="/favoritos">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700">
                  <Heart className="h-4 w-4" />
                  Favoritos
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                        isActive
                          ? 'bg-blue-400 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <ProfileInfo 
                    key="info"
                    user={userData} 
                    onUpdate={handleUserUpdate}
                    session={session}
                  />
                )}
                {activeTab === 'orders' && (
                  <ProfileOrders 
                    key="orders"
                    userId={userData?.id || session.user.id}
                    initialOrders={orders}
                  />
                )}
                {activeTab === 'addresses' && (
                  <ProfileAddresses 
                    key="addresses"
                    userId={userData?.id || session.user.id}
                  />
                )}
                {activeTab === 'favorites' && (
                  <ProfileFavorites 
                    key="favorites"
                  />
                )}
                {activeTab === 'security' && (
                  <ProfileSecurity 
                    key="security"
                    userId={userData?.id || session.user.id}
                    session={session}
                  />
                )}
                {activeTab === 'notifications' && (
                  <ProfileNotifications 
                    key="notifications"
                    onUnreadCountChange={setUnreadNotifications}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    }>
      <PerfilContent />
    </Suspense>
  )
}
