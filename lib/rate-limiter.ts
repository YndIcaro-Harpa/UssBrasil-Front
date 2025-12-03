/**
 * Rate Limiter - Proteção contra abuso de API
 * 
 * Implementa rate limiting usando sliding window com memória em processo.
 * Para produção, considere usar Redis para persistência entre instâncias.
 */

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
}

interface RateLimitConfig {
  windowMs: number      // Janela de tempo em millisegundos
  maxRequests: number   // Número máximo de requests na janela
  message?: string      // Mensagem de erro personalizada
  skipSuccessfulRequests?: boolean
  keyGenerator?: (identifier: string) => string
}

// Armazenamento em memória para rate limits
const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpar entradas antigas periodicamente (a cada 1 minuto)
const CLEANUP_INTERVAL = 60 * 1000
let cleanupTimer: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupTimer) return
  
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove entradas mais antigas que 2x a janela máxima (1 hora)
      if (now - entry.lastRequest > 2 * 60 * 60 * 1000) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

startCleanup()

// Configurações padrão para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  // API geral - 100 requests por minuto
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'Muitas requisições. Tente novamente em alguns segundos.'
  },
  
  // Auth endpoints - 5 tentativas por 15 minutos
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  
  // Register - 3 por hora
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Limite de registros atingido. Tente novamente em 1 hora.'
  },
  
  // Stripe/Checkout - 10 por minuto
  checkout: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Muitas tentativas de checkout. Aguarde um momento.'
  },
  
  // Upload - 20 por hora
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  },
  
  // Admin endpoints - 200 por minuto
  admin: {
    windowMs: 60 * 1000,
    maxRequests: 200,
    message: 'Limite de requisições admin atingido.'
  },
  
  // Newsletter - 1 por dia por email
  newsletter: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 1,
    message: 'Você já está inscrito na newsletter.'
  },
  
  // Contact form - 5 por hora
  contact: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Limite de mensagens atingido. Tente novamente em 1 hora.'
  },
  
  // Reviews - 10 por dia
  reviews: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Limite de avaliações atingido hoje.'
  },
  
  // Strict - Para endpoints sensíveis (password reset, etc)
  strict: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Por segurança, aguarde 1 hora antes de tentar novamente.'
  }
} as const

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

/**
 * Verifica se uma requisição está dentro do limite
 */
export function checkRateLimit(
  identifier: string,
  configOrType: RateLimitConfig | RateLimitType = 'default'
): { 
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
  message?: string
} {
  const config = typeof configOrType === 'string' 
    ? RATE_LIMIT_CONFIGS[configOrType]
    : configOrType
  
  const { windowMs, maxRequests, message } = config
  const key = 'keyGenerator' in config && config.keyGenerator 
    ? config.keyGenerator(identifier)
    : `${identifier}`
  
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry) {
    // Primeira requisição
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    })
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }
  
  // Verificar se a janela expirou
  if (now - entry.firstRequest > windowMs) {
    // Reset da janela
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    })
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }
  
  // Incrementar contador
  entry.count++
  entry.lastRequest = now
  
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.firstRequest + windowMs - now) / 1000)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.firstRequest + windowMs,
      retryAfter,
      message
    }
  }
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.firstRequest + windowMs
  }
}

/**
 * Wrapper para usar em API routes
 */
export function rateLimit(
  identifier: string,
  configOrType: RateLimitConfig | RateLimitType = 'default'
) {
  const result = checkRateLimit(identifier, configOrType)
  
  if (!result.allowed) {
    return {
      error: true,
      status: 429,
      headers: {
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': result.retryAfter?.toString() || '60'
      },
      body: {
        error: 'Too Many Requests',
        message: result.message || 'Rate limit exceeded',
        retryAfter: result.retryAfter
      }
    }
  }
  
  return {
    error: false,
    headers: {
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString()
    }
  }
}

/**
 * Extrai IP do request
 */
export function getClientIP(request: Request): string {
  // Vercel/Next.js headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }
  
  // Real IP header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Cria identificador combinando IP e endpoint
 */
export function createRateLimitKey(request: Request, prefix?: string): string {
  const ip = getClientIP(request)
  const url = new URL(request.url)
  const path = url.pathname
  
  return prefix ? `${prefix}:${ip}:${path}` : `${ip}:${path}`
}

/**
 * Helper para aplicar rate limit em API routes
 * 
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const rateLimitResult = applyRateLimit(request, 'auth')
 *   if (rateLimitResult) return rateLimitResult
 *   
 *   // Continue with request...
 * }
 * ```
 */
export function applyRateLimit(
  request: Request,
  configOrType: RateLimitConfig | RateLimitType = 'default'
): Response | null {
  const key = createRateLimitKey(request)
  const result = rateLimit(key, configOrType)
  
  if (result.error) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-RateLimit-Remaining': String(result.headers['X-RateLimit-Remaining']),
      'X-RateLimit-Reset': String(result.headers['X-RateLimit-Reset'])
    }
    
    if (result.headers['Retry-After']) {
      headers['Retry-After'] = String(result.headers['Retry-After'])
    }
    
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers
    })
  }
  
  return null
}

/**
 * Limpar rate limit para um identificador específico
 * Útil para casos como após login bem-sucedido
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Obter estatísticas de rate limit
 */
export function getRateLimitStats(): {
  totalEntries: number
  activeEntries: number
  oldestEntry: number | null
} {
  const now = Date.now()
  let activeCount = 0
  let oldest: number | null = null
  
  for (const entry of rateLimitStore.values()) {
    if (now - entry.lastRequest < 60 * 60 * 1000) {
      activeCount++
    }
    if (oldest === null || entry.firstRequest < oldest) {
      oldest = entry.firstRequest
    }
  }
  
  return {
    totalEntries: rateLimitStore.size,
    activeEntries: activeCount,
    oldestEntry: oldest
  }
}
