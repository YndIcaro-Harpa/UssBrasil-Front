'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface UseWishlistOptions {
  syncToServer?: boolean
}

export function useWishlist(options: UseWishlistOptions = {}) {
  const { syncToServer = true } = options
  const { user, favorites, toggleFavorite } = useAuth()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Sync wishlist from server on mount
  useEffect(() => {
    if (user && syncToServer) {
      syncFromServer()
    }
  }, [user, syncToServer])

  const syncFromServer = async () => {
    if (!user) return
    
    setSyncing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Merge server wishlist with local
        if (data.wishlist?.length > 0) {
          data.wishlist.forEach((id: string) => {
            if (!favorites.includes(id)) {
              toggleFavorite(id)
            }
          })
        }
        setLastSynced(new Date())
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error)
    } finally {
      setSyncing(false)
    }
  }

  const syncToServerApi = async () => {
    if (!user) return
    
    setSyncing(true)
    try {
      const token = localStorage.getItem('token')
      
      // Clear and re-add all items
      await fetch('/api/wishlist?clearAll=true', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Add each favorite
      for (const productId of favorites) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        })
      }
      
      setLastSynced(new Date())
      toast.success('Lista de desejos sincronizada!')
    } catch (error) {
      console.error('Error syncing to server:', error)
      toast.error('Erro ao sincronizar lista de desejos')
    } finally {
      setSyncing(false)
    }
  }

  const addToWishlist = useCallback(async (productId: string) => {
    if (favorites.includes(productId)) return
    
    setLoading(true)
    try {
      toggleFavorite(productId)
      
      if (user && syncToServer) {
        const token = localStorage.getItem('token')
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        })
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    } finally {
      setLoading(false)
    }
  }, [favorites, toggleFavorite, user, syncToServer])

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!favorites.includes(productId)) return
    
    setLoading(true)
    try {
      toggleFavorite(productId)
      
      if (user && syncToServer) {
        const token = localStorage.getItem('token')
        await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setLoading(false)
    }
  }, [favorites, toggleFavorite, user, syncToServer])

  const toggleWishlistItem = useCallback(async (productId: string) => {
    setLoading(true)
    try {
      toggleFavorite(productId)
      
      if (user && syncToServer) {
        const token = localStorage.getItem('token')
        await fetch('/api/wishlist', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        })
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setLoading(false)
    }
  }, [toggleFavorite, user, syncToServer])

  const clearWishlist = useCallback(async () => {
    setLoading(true)
    try {
      // Remove all from local
      favorites.forEach(id => toggleFavorite(id))
      
      if (user && syncToServer) {
        const token = localStorage.getItem('token')
        await fetch('/api/wishlist?clearAll=true', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
      
      toast.success('Lista de desejos limpa!')
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      toast.error('Erro ao limpar lista de desejos')
    } finally {
      setLoading(false)
    }
  }, [favorites, toggleFavorite, user, syncToServer])

  const isInWishlist = useCallback((productId: string) => {
    return favorites.includes(productId)
  }, [favorites])

  return {
    wishlist: favorites,
    count: favorites.length,
    loading,
    syncing,
    lastSynced,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    clearWishlist,
    isInWishlist,
    syncFromServer,
    syncToServer: syncToServerApi
  }
}

export default useWishlist
