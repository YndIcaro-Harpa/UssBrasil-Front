'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { generatePageNumbers } from '@/lib/pagination'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 5,
  size = 'md',
  className = ''
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const pages = generatePageNumbers(currentPage, totalPages, maxVisible)
  
  const sizeClasses = {
    sm: 'h-7 min-w-7 text-xs',
    md: 'h-9 min-w-9 text-sm',
    lg: 'h-11 min-w-11 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const baseButtonClass = `
    inline-flex items-center justify-center rounded-lg border font-medium
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `

  const activeClass = 'bg-[uss-admin] text-white border-[uss-admin] shadow-sm'
  const inactiveClass = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
  const disabledClass = 'bg-gray-100 text-gray-400 border-gray-200'

  return (
    <nav 
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Paginação"
    >
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${baseButtonClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
          aria-label="Primeira página"
          title="Primeira página"
        >
          <ChevronsLeft className={iconSizes[size]} />
        </button>
      )}

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseButtonClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        aria-label="Página anterior"
        title="Página anterior"
      >
        <ChevronLeft className={iconSizes[size]} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          page === '...' ? (
            <span 
              key={`ellipsis-${index}`}
              className="px-2 text-gray-500"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${baseButtonClass} px-3 ${
                currentPage === page ? activeClass : inactiveClass
              }`}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseButtonClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        aria-label="Próxima página"
        title="Próxima página"
      >
        <ChevronRight className={iconSizes[size]} />
      </button>

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
          aria-label="Última página"
          title="Última página"
        >
          <ChevronsRight className={iconSizes[size]} />
        </button>
      )}
    </nav>
  )
}

interface PaginationInfoProps {
  currentPage: number
  limit: number
  total: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  limit,
  total,
  className = ''
}: PaginationInfoProps) {
  const start = (currentPage - 1) * limit + 1
  const end = Math.min(currentPage * limit, total)

  if (total === 0) {
    return (
      <p className={`text-sm text-gray-500 ${className}`}>
        Nenhum resultado encontrado
      </p>
    )
  }

  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      Mostrando <span className="font-medium text-gray-700">{start}</span> a{' '}
      <span className="font-medium text-gray-700">{end}</span> de{' '}
      <span className="font-medium text-gray-700">{total}</span> resultados
    </p>
  )
}

interface PaginationControlsProps extends AdminPaginationProps {
  limit: number
  total: number
  onLimitChange?: (limit: number) => void
  showInfo?: boolean
  showLimitSelector?: boolean
  limitOptions?: number[]
}

export function PaginationControls({
  currentPage,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
  showInfo = true,
  showLimitSelector = true,
  showFirstLast = true,
  maxVisible = 5,
  size = 'md',
  limitOptions = [10, 20, 50, 100],
  className = ''
}: PaginationControlsProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info */}
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          limit={limit}
          total={total}
        />
      )}

      <div className="flex items-center gap-4">
        {/* Limit Selector */}
        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-9 px-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[uss-admin] focus:border-[uss-admin]"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showFirstLast={showFirstLast}
          maxVisible={maxVisible}
          size={size}
        />
      </div>
    </div>
  )
}

export default AdminPagination

