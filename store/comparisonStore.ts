'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

interface Product {
  id: string | number
  name: string
  price: number
  discountPrice?: number | null
  image?: string
  images?: string[]
  brand?: string
  category?: string
  categoryName?: string
  stock?: number
  rating?: number
  reviews?: number
  description?: string
  specifications?: Record<string, string>
  [key: string]: any
}

interface ComparisonStore {
  items: Product[]
  maxItems: number
  addToComparison: (product: Product) => boolean
  removeFromComparison: (productId: string | number) => void
  clearComparison: () => void
  isInComparison: (productId: string | number) => boolean
  canAddMore: () => boolean
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      
      addToComparison: (product: Product) => {
        const { items, maxItems } = get()
        
        // Check if already in comparison
        if (items.some(item => String(item.id) === String(product.id))) {
          toast.error('Produto já está na comparação')
          return false
        }
        
        // Check max items
        if (items.length >= maxItems) {
          toast.error(`Máximo de ${maxItems} produtos para comparar`)
          return false
        }
        
        set({ items: [...items, product] })
        toast.success('Adicionado à comparação!')
        return true
      },
      
      removeFromComparison: (productId: string | number) => {
        const { items } = get()
        set({ items: items.filter(item => String(item.id) !== String(productId)) })
        toast.success('Removido da comparação')
      },
      
      clearComparison: () => {
        set({ items: [] })
        toast.success('Comparação limpa')
      },
      
      isInComparison: (productId: string | number) => {
        const { items } = get()
        return items.some(item => String(item.id) === String(productId))
      },
      
      canAddMore: () => {
        const { items, maxItems } = get()
        return items.length < maxItems
      }
    }),
    {
      name: 'comparison-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
)

export default useComparisonStore
