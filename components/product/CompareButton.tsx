'use client'

import { Scale, Check } from 'lucide-react'
import { useComparisonStore } from '@/store/comparisonStore'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

interface CompareButtonProps {
  product: Product
  variant?: 'icon' | 'button' | 'mini'
  className?: string
  showText?: boolean
}

export function CompareButton({ 
  product, 
  variant = 'icon', 
  className = '',
  showText = false 
}: CompareButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison, items, maxItems } = useComparisonStore()
  
  const inComparison = isInComparison(product.id)
  const canAdd = items.length < maxItems

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inComparison) {
      removeFromComparison(product.id)
    } else {
      addToComparison(product)
    }
  }

  if (variant === 'mini') {
    return (
      <button
        onClick={handleClick}
        className={`p-1 rounded transition-colors ${
          inComparison 
            ? 'text-[#034a6e] bg-[#034a6e]/10' 
            : 'text-gray-400 hover:text-[#034a6e] hover:bg-gray-100'
        } ${!canAdd && !inComparison ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        disabled={!canAdd && !inComparison}
        title={inComparison ? 'Remover da comparação' : 'Adicionar à comparação'}
      >
        {inComparison ? (
          <Check className="w-4 h-4" />
        ) : (
          <Scale className="w-4 h-4" />
        )}
      </button>
    )
  }

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={`p-2 rounded-full transition-all ${
                inComparison 
                  ? 'bg-[#034a6e] text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-[#034a6e] hover:text-white shadow'
              } ${!canAdd && !inComparison ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
              disabled={!canAdd && !inComparison}
            >
              {inComparison ? (
                <Check className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{inComparison ? 'Na comparação' : canAdd ? 'Comparar' : 'Limite atingido'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full button variant
  return (
    <Button
      onClick={handleClick}
      variant={inComparison ? 'default' : 'outline'}
      className={`${
        inComparison 
          ? 'bg-[#034a6e] hover:bg-[#023a58] text-white' 
          : 'border-[#034a6e] text-[#034a6e] hover:bg-[#034a6e] hover:text-white'
      } ${!canAdd && !inComparison ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={!canAdd && !inComparison}
    >
      {inComparison ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Na Comparação
        </>
      ) : (
        <>
          <Scale className="w-4 h-4 mr-2" />
          {showText ? 'Comparar' : 'Adicionar'}
        </>
      )}
    </Button>
  )
}

// Floating comparison bar component
export function ComparisonBar() {
  const { items, clearComparison } = useComparisonStore()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#034a6e] text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Scale className="w-6 h-6" />
          <span className="font-medium">
            {items.length} produto{items.length > 1 ? 's' : ''} para comparar
          </span>
          <div className="flex gap-2">
            {items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="w-10 h-10 bg-white rounded overflow-hidden"
              >
                <img
                  src={item.image || item.images?.[0] || '/images/placeholders/product-placeholder.svg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {items.length > 3 && (
              <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-sm">
                +{items.length - 3}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearComparison}
            className="text-white/70 hover:text-white text-sm"
          >
            Limpar
          </button>
          <a
            href="/comparacao"
            className="px-4 py-2 bg-[#54c4cf] hover:bg-[#3fb0bb] rounded-lg font-medium transition-colors"
          >
            Comparar Agora
          </a>
        </div>
      </div>
    </div>
  )
}

export default CompareButton
