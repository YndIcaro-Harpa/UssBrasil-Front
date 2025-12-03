/**
 * Utilitários de Paginação
 * 
 * Funções auxiliares para implementar paginação consistente em toda a aplicação.
 */

// Interface para parâmetros de paginação
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Configuração padrão de paginação
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100
export const MIN_LIMIT = 1

/**
 * Parseia e valida parâmetros de paginação de uma URL
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const sortBy = searchParams.get('sortBy') || undefined
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null
  
  let page = parseInt(pageParam || String(DEFAULT_PAGE), 10)
  let limit = parseInt(limitParam || String(DEFAULT_LIMIT), 10)
  
  // Validar page
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  
  // Validar limit
  if (isNaN(limit) || limit < MIN_LIMIT) {
    limit = DEFAULT_LIMIT
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT
  }
  
  return {
    page,
    limit,
    sortBy,
    sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc'
  }
}

/**
 * Calcula offset para query de banco de dados
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Cria objeto de paginação para resposta da API
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginatedResponse<never>['pagination'] {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  }
}

/**
 * Aplica paginação a um array em memória
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  limit: number
): PaginatedResponse<T> {
  const total = array.length
  const offset = calculateOffset(page, limit)
  const data = array.slice(offset, offset + limit)
  
  return {
    data,
    pagination: createPaginationMeta(total, page, limit)
  }
}

/**
 * Gera parâmetros Prisma para paginação
 */
export function getPrismaParams(params: PaginationParams) {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy, sortOrder = 'desc' } = params
  
  const prismaParams: {
    skip: number
    take: number
    orderBy?: Record<string, 'asc' | 'desc'>
  } = {
    skip: calculateOffset(page, limit),
    take: limit
  }
  
  if (sortBy) {
    prismaParams.orderBy = { [sortBy]: sortOrder }
  }
  
  return prismaParams
}

/**
 * Cria resposta paginada completa
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = params
  
  return {
    data,
    pagination: createPaginationMeta(total, page, limit)
  }
}

/**
 * Hook para uso em componentes React (client-side)
 */
export function usePaginationState(initialPage = 1, initialLimit = DEFAULT_LIMIT) {
  return {
    page: initialPage,
    limit: initialLimit,
    setPage: (newPage: number) => Math.max(1, newPage),
    setLimit: (newLimit: number) => Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, newLimit)),
    nextPage: (currentPage: number, totalPages: number) => 
      currentPage < totalPages ? currentPage + 1 : currentPage,
    prevPage: (currentPage: number) => 
      currentPage > 1 ? currentPage - 1 : currentPage,
    goToPage: (page: number, totalPages: number) => 
      Math.min(totalPages, Math.max(1, page))
  }
}

/**
 * Gera array de números de página para UI de paginação
 * Mostra: first, ..., current-1, current, current+1, ..., last
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): (number | '...')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const pages: (number | '...')[] = []
  const halfVisible = Math.floor(maxVisible / 2)
  
  let startPage = Math.max(1, currentPage - halfVisible)
  let endPage = Math.min(totalPages, currentPage + halfVisible)
  
  // Ajustar se estamos perto do início ou fim
  if (currentPage <= halfVisible) {
    endPage = Math.min(totalPages, maxVisible - 1)
  }
  if (currentPage > totalPages - halfVisible) {
    startPage = Math.max(1, totalPages - maxVisible + 2)
  }
  
  // Sempre mostrar primeira página
  if (startPage > 1) {
    pages.push(1)
    if (startPage > 2) {
      pages.push('...')
    }
  }
  
  // Páginas do meio
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  // Sempre mostrar última página
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...')
    }
    pages.push(totalPages)
  }
  
  return pages
}

/**
 * Componente React para controles de paginação (use com shadcn/ui)
 * Este é apenas um helper, você deve implementar o componente real
 */
export const paginationStyles = {
  container: 'flex items-center justify-center gap-2',
  button: 'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
  buttonActive: 'bg-[#034a6e] text-white border-[#034a6e]',
  buttonInactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  buttonDisabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  ellipsis: 'px-2 text-gray-500'
}

/**
 * Construir URL com parâmetros de paginação
 */
export function buildPaginationUrl(
  baseUrl: string,
  params: PaginationParams & Record<string, string | number | undefined>
): string {
  const url = new URL(baseUrl, 'http://localhost')
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })
  
  return url.pathname + url.search
}
