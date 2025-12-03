'use client'

import Image from 'next/image'
import { useState } from 'react'

// Placeholder paths
export const PLACEHOLDERS = {
  product: '/images/placeholders/product-placeholder.svg',
  category: '/images/placeholders/category-placeholder.svg',
  brand: '/images/placeholders/brand-placeholder.svg',
  user: '/images/placeholders/user-placeholder.svg',
  banner: '/images/placeholders/banner-placeholder.svg'
} as const

export type PlaceholderType = keyof typeof PLACEHOLDERS

interface PlaceholderImageProps {
  src?: string | null
  alt: string
  type?: PlaceholderType
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  style?: React.CSSProperties
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

/**
 * PlaceholderImage component that shows a contextual placeholder when image is missing or fails to load
 */
export function PlaceholderImage({
  src,
  alt,
  type = 'product',
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  style,
  objectFit = 'cover'
}: PlaceholderImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const imageSrc = error || !src ? PLACEHOLDERS[type] : src

  // For fill mode, we need to handle sizes for responsive images
  const defaultSizes = fill ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined

  return (
    <div className={`relative ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit }}
        priority={priority}
        sizes={sizes || defaultSizes}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
        unoptimized={imageSrc.endsWith('.svg')}
      />
    </div>
  )
}

// Inline SVG placeholders for when you need them embedded directly
export const InlinePlaceholders = {
  product: (props: { className?: string }) => (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={props.className}>
      <rect width="400" height="400" fill="#f8fafc"/>
      <rect x="1" y="1" width="398" height="398" stroke="#e2e8f0" strokeWidth="2" fill="none"/>
      <g transform="translate(140, 130)">
        <path d="M60 20L120 55V125L60 90L0 125V55L60 20Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
        <path d="M60 20L120 55L60 90L0 55L60 20Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2"/>
        <path d="M60 20V90M0 55H120" stroke="#94a3b8" strokeWidth="2"/>
      </g>
      <text x="200" y="300" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="#034a6e" fontWeight="bold">USS Brasil</text>
      <text x="200" y="320" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fill="#64748b">Imagem não disponível</text>
    </svg>
  ),
  
  user: (props: { className?: string }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={props.className}>
      <circle cx="100" cy="100" r="99" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
      <g transform="translate(55, 45)">
        <circle cx="45" cy="35" r="30" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
        <path d="M0 110C0 85 20 65 45 65C70 65 90 85 90 110" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
      </g>
    </svg>
  ),
  
  category: (props: { className?: string }) => (
    <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={props.className}>
      <rect width="600" height="400" fill="#f8fafc"/>
      <rect x="1" y="1" width="598" height="398" stroke="#e2e8f0" strokeWidth="2" fill="none"/>
      <g transform="translate(230, 120)">
        <rect x="0" y="0" width="50" height="50" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
        <rect x="60" y="0" width="50" height="50" rx="8" fill="#54c4cf" opacity="0.3" stroke="#54c4cf" strokeWidth="2"/>
        <rect x="0" y="60" width="50" height="50" rx="8" fill="#034a6e" opacity="0.2" stroke="#034a6e" strokeWidth="2"/>
        <rect x="60" y="60" width="50" height="50" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
      </g>
      <text x="300" y="300" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fill="#034a6e" fontWeight="bold">USS Brasil</text>
    </svg>
  )
}

export default PlaceholderImage
