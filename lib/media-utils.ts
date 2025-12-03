// Utility para gerenciar URLs de mídia (imagens e vídeos)

import { BACKEND_URL } from './config'
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmazlvs6'

/**
 * Verifica se uma URL é absoluta (http/https)
 */
export function isAbsoluteUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Verifica se é uma URL do Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com')
}

/**
 * Converte path relativo ou URL do backend para URL completa
 * Suporta:
 * - URLs absolutas (http/https): retorna como está
 * - URLs Cloudinary: retorna como está
 * - Paths relativos (/uploads/...): adiciona BACKEND_URL
 * - Public IDs Cloudinary (sem protocolo): gera URL Cloudinary
 */
export function getMediaUrl(path: string | undefined, type: 'image' | 'video' = 'image'): string {
  // Fallback padrão
  if (!path || path.trim() === '') {
    return type === 'video' ? '/fallback-video.mp4' : '/fallback-product.png'
  }

  const trimmedPath = path.trim()

  // Se já é URL absoluta, retorna
  if (isAbsoluteUrl(trimmedPath)) {
    return trimmedPath
  }

  // Se é path relativo do backend (/uploads/...)
  if (trimmedPath.startsWith('/uploads') || trimmedPath.startsWith('uploads')) {
    const cleanPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`
    return `${BACKEND_URL}${cleanPath}`
  }

  // Se parece com public_id do Cloudinary (sem protocolo e sem barra inicial)
  // Exemplo: "products/iphone-17-pro", "videos/hero-video"
  if (!trimmedPath.startsWith('/') && !trimmedPath.includes('://')) {
    const resourceType = type === 'video' ? 'video' : 'image'
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${trimmedPath}`
  }

  // Se começa com barra mas não é /uploads, assume que é path relativo do frontend
  if (trimmedPath.startsWith('/')) {
    return trimmedPath
  }

  // Fallback final
  return type === 'video' ? '/fallback-video.mp4' : '/fallback-product.png'
}

/**
 * Converte array de paths para URLs completas
 */
export function getMediaUrls(paths: string[] | string | undefined, type: 'image' | 'video' = 'image'): string[] {
  if (!paths) return []
  
  const pathArray = Array.isArray(paths) 
    ? paths 
    : (typeof paths === 'string' ? paths.split(',').map(p => p.trim()).filter(Boolean) : [])
  
  return pathArray
    .map(path => getMediaUrl(path, type))
    .filter(url => url !== '/fallback-product.png' && url !== '/fallback-video.mp4')
}

/**
 * Gera URL Cloudinary com transformações
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'fit' | 'scale' | 'limit'
    quality?: 'auto' | number
    format?: 'webp' | 'jpg' | 'png'
    gravity?: 'auto' | 'face' | 'center'
  } = {}
): string {
  if (!publicId) return '/fallback-product.png'
  
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'webp',
    gravity = 'auto'
  } = options

  const transformations: string[] = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop) transformations.push(`c_${crop}`)
  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)
  if (gravity) transformations.push(`g_${gravity}`)

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`
}

/**
 * Gera thumbnail de vídeo do Cloudinary
 */
export function getVideoThumbnail(videoPublicId: string, options: { width?: number, height?: number } = {}): string {
  const { width = 640, height = 360 } = options
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/w_${width},h_${height},c_fill,so_0/${videoPublicId}.jpg`
}

/**
 * Helper para Next.js Image component
 */
export function getImageProps(src: string | undefined, alt: string = '') {
  const url = getMediaUrl(src, 'image')
  
  return {
    src: url,
    alt,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement
      img.src = '/fallback-product.png'
    }
  }
}

/**
 * Valida se arquivo de mídia existe (pode ser usado com React Query)
 */
export async function validateMediaUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
