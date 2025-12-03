'use client'

import { Skeleton } from '@/components/ui/skeleton'

// Skeleton para cards de produto
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para grid de produtos
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton para linha de tabela
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3 lg:p-4">
          <Skeleton className="h-4 w-full max-w-[150px] rounded-lg" />
        </td>
      ))}
    </tr>
  )
}

// Skeleton para tabela completa
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3 lg:p-4 text-left">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Skeleton para card de estatística
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 lg:p-4 shadow-sm">
      <div className="flex items-center space-x-2 lg:space-x-3">
        <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-5 lg:h-6 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para stats grid
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton para pedido
export function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </div>
    </div>
  )
}

// Skeleton para lista de pedidos
export function OrderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton para perfil do usuário
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton para página de admin
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 lg:h-8 w-36 lg:w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 lg:w-32 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 lg:h-10 w-20 lg:w-24 rounded-xl" />
          <Skeleton className="h-9 lg:h-10 w-28 lg:w-32 rounded-xl" />
        </div>
      </div>
      
      {/* Stats */}
      <StatsGridSkeleton />
      
      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-full lg:w-48 rounded-xl" />
        </div>
      </div>
      
      {/* Table */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}

// Skeleton para categoria card
export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

// Skeleton para grid de categorias
export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton para dashboard cards
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-white/20" />
      </div>
      <Skeleton className="h-3 w-24 mb-2 rounded bg-white/20" />
      <Skeleton className="h-7 lg:h-8 w-20 rounded bg-white/20" />
      <Skeleton className="h-3 w-16 mt-2 rounded bg-white/20" />
    </div>
  )
}

// Skeleton para dashboard completo
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 lg:h-8 w-32 rounded-lg bg-white/20" />
          <Skeleton className="h-4 w-48 rounded bg-white/20" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl bg-white/20" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 lg:p-6">
          <Skeleton className="h-6 w-40 mb-6 rounded bg-white/20" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 lg:p-6">
          <Skeleton className="h-6 w-36 mb-6 rounded bg-white/20" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Aliases para compatibilidade
export const ProductTableRowSkeleton = () => <TableRowSkeleton columns={6} />
export const OrderTableRowSkeleton = () => <TableRowSkeleton columns={6} />
export const StatsCardSkeleton = StatCardSkeleton
