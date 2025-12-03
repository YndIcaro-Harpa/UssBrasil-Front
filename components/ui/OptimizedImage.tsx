'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Base64 placeholder for blur effect (small gray square)
const DEFAULT_BLUR_DATA_URL = 
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIhAAAgEEAQQDAAAAAAAAAAAAAQIDAAQFESESBhMiMUGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAT/xAAZEQABBQAAAAAAAAAAAAAAAAABAAIDESH/2gAMAwEAAhEDEEEhEEaAgF7AgD/Z';

// Fallback image URL
const FALLBACK_IMAGE = '/images/placeholder-product.jpg';

// Generate responsive sizes for common use cases
const generateSizes = (type: 'product' | 'banner' | 'thumbnail' | 'hero' = 'product') => {
  switch (type) {
    case 'thumbnail':
      return '(max-width: 640px) 100px, 150px';
    case 'product':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'banner':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
    case 'hero':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
};

/**
 * OptimizedImage - Componente de imagem otimizado para performance
 * 
 * Features:
 * - Lazy loading automático (exceto priority=true)
 * - Placeholder blur durante carregamento
 * - Fallback para imagens quebradas
 * - Tamanhos responsivos otimizados
 * - Suporte a Cloudinary transformations
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Check if the src is external (Cloudinary, etc.)
  const isExternal = imgSrc.startsWith('http') || imgSrc.startsWith('//');
  
  // For external images, we use unoptimized to avoid Next.js image optimization limits
  const shouldOptimize = !isExternal || imgSrc.includes('cloudinary.com') || imgSrc.includes('res.cloudinary.com');

  const imageProps = {
    src: imgSrc,
    alt,
    quality,
    priority,
    sizes: sizes || generateSizes('product'),
    className: `${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`,
    onLoad: handleLoad,
    onError: handleError,
    ...(placeholder === 'blur' && { placeholder, blurDataURL }),
    ...(shouldOptimize ? {} : { unoptimized: true }),
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
    />
  );
}

/**
 * ProductImage - Componente específico para imagens de produtos
 */
export function ProductImage({
  src,
  alt,
  size = 'medium',
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  priority?: boolean;
}) {
  const sizeMap = {
    small: { width: 100, height: 100, sizes: '100px' },
    medium: { width: 300, height: 300, sizes: '(max-width: 640px) 150px, 300px' },
    large: { width: 500, height: 500, sizes: '(max-width: 640px) 100vw, 500px' },
    full: { width: 800, height: 800, sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px' },
  };

  const { width, height, sizes } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`rounded-lg ${className}`}
      quality={size === 'full' ? 85 : 75}
    />
  );
}

/**
 * BannerImage - Componente para banners promocionais
 */
export function BannerImage({
  src,
  alt,
  className = '',
  priority = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative w-full aspect-[21/9] ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={generateSizes('banner')}
        quality={85}
      />
    </div>
  );
}

/**
 * ThumbnailImage - Componente para thumbnails (carrinho, listas)
 */
export function ThumbnailImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={80}
      height={80}
      sizes={generateSizes('thumbnail')}
      quality={60}
      className={`rounded-md ${className}`}
    />
  );
}

/**
 * HeroImage - Componente para hero sections
 */
export function HeroImage({
  src,
  alt,
  className = '',
  overlay = false,
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
}) {
  return (
    <div className={`relative w-full h-[60vh] min-h-[400px] ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        sizes={generateSizes('hero')}
        quality={90}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}
    </div>
  );
}

/**
 * ImageGallery - Galeria de imagens para página de produto
 */
export function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Sem imagem</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
        <OptimizedImage
          src={images[selectedIndex]}
          alt={`${productName} - Imagem ${selectedIndex + 1}`}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <OptimizedImage
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                quality={50}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
