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
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin')
        setChecking(false)
        return
      }

      // Check if user is admin
      const userIsAdmin = user?.role === 'ADMIN' || user?.role === 'admin'
      setIsAdmin(userIsAdmin)
      
      if (!userIsAdmin) {
        router.push('/')
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
