'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAdminAuth() {
  const { user, token, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // Check if user is admin (case-insensitive)
      const userRole = user?.role?.toUpperCase()
      const userIsAdmin = userRole === 'ADMIN'
      
      console.log('[useAdminAuth] Status:', { 
        isAuthenticated, 
        userRole: user?.role,
        userIsAdmin,
        email: user?.email 
      })
      
      setIsAdmin(userIsAdmin)
      
      // Não redirecionar - o middleware já faz isso
      // Se chegou aqui e está autenticado, confiar no middleware
      if (isAuthenticated) {
        setIsAdmin(userIsAdmin)
      }
      
      setChecking(false)
    }
  }, [isAuthenticated, isLoading, user, router])

  return {
    user,
    token,
    isAdmin,
    isLoading: isLoading || checking,
    isAuthenticated,
  }
}

export default useAdminAuth
