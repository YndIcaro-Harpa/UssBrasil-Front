import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Security Headers Configuration
const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  // HSTS - Only in production
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  })
}

// CSP Configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Required for Next.js dev mode
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "http://localhost:3001",
    "https://ussbrasil-back.onrender.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "http://localhost:3001",
    "https://ussbrasil-back.onrender.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://vitals.vercel-insights.com"
  ],
  'frame-src': [
    "'self'",
    "https://www.youtube.com",
    "https://player.vimeo.com"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null
}

// Build CSP string
function buildCSP(): string {
  return Object.entries(cspDirectives)
    .filter(([_, values]) => values !== null)
    .map(([directive, values]) => {
      if (Array.isArray(values) && values.length === 0) {
        return directive
      }
      return `${directive} ${(values as string[]).join(' ')}`
    })
    .join('; ')
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas que requerem autenticação de admin
  const isAdminRoute = path.startsWith('/admin')
  const isPerfilRoute = path.startsWith('/perfil')
  
  // Obter token do usuário
  const token = await getToken({ 
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Proteção de rotas admin
  if (isAdminRoute) {
    // Se não está autenticado, redirecionar para home
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verificar se o usuário é admin
    const isAdmin = token.email === 'admin@ussbrasil.com' || token.role === 'admin'
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Proteção de rotas de perfil (requer autenticação)
  if (isPerfilRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Create response with security headers
  const response = NextResponse.next()
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value)
  })
  
  // Apply CSP header (report-only in development for easier debugging)
  const csp = buildCSP()
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', csp)
  } else {
    response.headers.set('Content-Security-Policy-Report-Only', csp)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
