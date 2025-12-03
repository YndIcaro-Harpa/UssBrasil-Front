"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface UserProfile { 
  id: string
  name: string
  email: string
  createdAt: string
  role?: string
  image?: string
  phone?: string
}

interface OrderItem { 
  productId: string
  name: string
  price: number
  quantity: number
  image: string 
}

interface Order { 
  id: string
  items: OrderItem[]
  total: number
  createdAt: string
  status: string 
}

interface Address {
  id: string
  label: string
  street: string
  number?: string
  city: string
  state: string
  zip: string
  complement?: string
  default?: boolean
}

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  holder: string
  exp: string
  default?: boolean
  type?: 'card' | 'pix' | 'boleto'
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  favorites: string[]
  orders: Order[]
  addresses: Address[]
  paymentMethods: PaymentMethod[]
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  
  // User Actions
  setUser: (user: UserProfile | null) => void
  toggleFavorite: (id: string) => void
  addOrder: (items: OrderItem[]) => Order
  updateOrderStatus: (orderId: string, status: string) => void
  
  // Address management
  addAddress: (address: Omit<Address, 'id'>) => Address
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  
  // Payment methods
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => PaymentMethod
  removePaymentMethod: (id: string) => void
  setDefaultPayment: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = 'uss_auth_token'
const USER_DATA_KEY = 'uss_user_data'
const FAVORITES_KEY = 'uss_favorites'
const ORDERS_KEY = 'uss_orders'
const ADDRESSES_KEY = 'uss_addresses'
const PAYMENT_METHODS_KEY = 'uss_payment_methods'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Integração com NextAuth - sincroniza sessão
  const { data: session, status } = useSession()

  // Sincronizar com NextAuth quando a sessão mudar
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user) {
      // Sessão NextAuth ativa - sincronizar com estado local
      const nextAuthUser: UserProfile = {
        id: (session.user as any).id || session.user.email || '',
        name: session.user.name || '',
        email: session.user.email || '',
        createdAt: new Date().toISOString(),
        role: (session.user as any).role || 'user',
        image: session.user.image || undefined,
      }
      
      setUserState(nextAuthUser)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(nextAuthUser))
      
      // Token do NextAuth (se disponível)
      if ((session as any).accessToken) {
        setToken((session as any).accessToken)
        localStorage.setItem(AUTH_TOKEN_KEY, (session as any).accessToken)
      }
      
      setIsLoading(false)
    } else if (status === 'unauthenticated') {
      // Verificar se existe sessão local
      const storedUser = localStorage.getItem(USER_DATA_KEY)
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      
      if (storedUser && storedToken) {
        try {
          setUserState(JSON.parse(storedUser))
          setToken(storedToken)
        } catch (e) {
          console.warn('Error parsing stored user data:', e)
          localStorage.removeItem(USER_DATA_KEY)
          localStorage.removeItem(AUTH_TOKEN_KEY)
        }
      }
      setIsLoading(false)
    }
  }, [session, status])

  // Load outras informações do localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY)
        const storedOrders = localStorage.getItem(ORDERS_KEY)
        const storedAddresses = localStorage.getItem(ADDRESSES_KEY)
        const storedPaymentMethods = localStorage.getItem(PAYMENT_METHODS_KEY)
        
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites))
        if (storedOrders) setOrders(JSON.parse(storedOrders))
        if (storedAddresses) setAddresses(JSON.parse(storedAddresses))
        if (storedPaymentMethods) setPaymentMethods(JSON.parse(storedPaymentMethods))
      } catch (e) {
        console.warn('Error loading stored data:', e)
      }
    }

    loadStoredData()
  }, [])

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  // Persist orders
  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders])

  // Persist addresses
  useEffect(() => {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses))
  }, [addresses])

  // Persist payment methods
  useEffect(() => {
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(paymentMethods))
  }, [paymentMethods])

  const setUser = useCallback((newUser: UserProfile | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(USER_DATA_KEY)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas')
      }

      const authToken = data.access_token || data.token
      localStorage.setItem(AUTH_TOKEN_KEY, authToken)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user))
      
      setToken(authToken)
      setUserState(data.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta')
      }

      const authToken = data.access_token || data.token
      localStorage.setItem(AUTH_TOKEN_KEY, authToken)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user))
      
      setToken(authToken)
      setUserState(data.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    // Limpar localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    localStorage.removeItem(FAVORITES_KEY)
    localStorage.removeItem(ORDERS_KEY)
    
    // Limpar estado
    setToken(null)
    setUserState(null)
    setFavorites([])
    setOrders([])
    
    // Fazer logout do NextAuth também
    try {
      await nextAuthSignOut({ redirect: false })
    } catch (e) {
      console.warn('NextAuth signOut error:', e)
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }, [])

  const addOrder = useCallback((items: OrderItem[]): Order => {
    const order: Order = {
      id: crypto.randomUUID(),
      items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    setOrders(prev => [order, ...prev])
    return order
  }, [])

  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }, [])

  const addAddress = useCallback((address: Omit<Address, 'id'>): Address => {
    const newAddress: Address = { id: crypto.randomUUID(), ...address }
    setAddresses(prev => {
      let updated = [...prev]
      if (newAddress.default) {
        updated = updated.map(a => ({ ...a, default: false }))
      }
      return [newAddress, ...updated]
    })
    return newAddress
  }, [])

  const removeAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }, [])

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })))
  }, [])

  const addPaymentMethod = useCallback((pm: Omit<PaymentMethod, 'id'>): PaymentMethod => {
    const newPm: PaymentMethod = { id: crypto.randomUUID(), ...pm }
    setPaymentMethods(prev => {
      let updated = [...prev]
      if (newPm.default) updated = updated.map(p => ({ ...p, default: false }))
      return [newPm, ...updated]
    })
    return newPm
  }, [])

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id))
  }, [])

  const setDefaultPayment = useCallback((id: string) => {
    setPaymentMethods(prev => prev.map(p => ({ ...p, default: p.id === id })))
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    token,
    favorites,
    orders,
    addresses,
    paymentMethods,
    
    login,
    register,
    logout,
    setUser,
    toggleFavorite,
    addOrder,
    updateOrderStatus,
    addAddress,
    removeAddress,
    setDefaultAddress,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPayment
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: null,
      favorites: [],
      orders: [],
      addresses: [],
      paymentMethods: [],
      login: async () => {},
      register: async () => {},
      logout: () => {},
      setUser: () => {},
      toggleFavorite: () => {},
      addOrder: () => ({ id: '', items: [], total: 0, createdAt: '', status: '' }),
      updateOrderStatus: () => {},
      addAddress: () => ({ id: '', label: '', street: '', city: '', state: '', zip: '' }),
      removeAddress: () => {},
      setDefaultAddress: () => {},
      addPaymentMethod: () => ({ id: '', brand: '', last4: '', holder: '', exp: '' }),
      removePaymentMethod: () => {},
      setDefaultPayment: () => {},
    } as AuthContextType
  }
  return context
}

export const useUserSession = useAuth
