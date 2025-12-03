/**
 * Image Optimization Utilities
 * 
 * Funções utilitárias para otimização de imagens no projeto USS Brasil
 */

// Cloudinary base URL (se configurado)
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Default blur data URL
export const DEFAULT_BLUR_DATA_URL = 
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Fallback image
export const FALLBACK_IMAGE = '/images/placeholder-product.jpg';

// Image loader for Next.js
export const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  const params = [`w=${width}`];
  
  if (quality) {
    params.push(`q=${quality}`);
  }
  
  // Se é Cloudinary, usa transformações nativas
  if (src.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(src, { width, quality: quality || 75 });
  }
  
  // If using a CDN, you can modify this to use your CDN's URL structure
  return `${src}?${params.join('&')}`;
};

/**
 * Transforma URL de imagem para usar otimizações Cloudinary
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
    gravity?: 'auto' | 'center' | 'face' | 'faces';
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url;
  }

  const transforms: string[] = [];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  return `${urlParts[0]}/upload/${transforms.join(',')}/${urlParts[1]}`;
}

export const optimizedImageProps = (src: string, alt: string, priority = false) => ({
  src: normalizeImageUrl(src),
  alt,
  priority,
  quality: priority ? 95 : 85,
  placeholder: 'blur' as const,
  blurDataURL: DEFAULT_BLUR_DATA_URL,
});

// Responsive sizes for different image types
export const categoryImageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
export const productImageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
export const heroImageSizes = '100vw';
export const thumbnailImageSizes = '80px';
export const bannerImageSizes = '(max-width: 768px) 100vw, 80vw';

// Lazy loading configuration
export const lazyLoadConfig = {
  threshold: 0.1,
  rootMargin: '50px 0px',
};

// WebP support detection
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

// AVIF support detection
export const supportsAVIF = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/avif').startsWith('data:image/avif');
};

// Generate srcSet for responsive images
export const generateSrcSet = (baseSrc: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1536]) => {
  if (!baseSrc) return '';
  
  if (baseSrc.includes('cloudinary.com')) {
    return sizes
      .map((w) => `${optimizeCloudinaryUrl(baseSrc, { width: w })} ${w}w`)
      .join(', ');
  }
  
  return sizes
    .map(size => `${imageLoader({ src: baseSrc, width: size })} ${size}w`)
    .join(', ');
};

/**
 * Normaliza URL de imagem
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return FALLBACK_IMAGE;
  
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  return url;
}

/**
 * Verifica se uma imagem é externa
 */
export function isExternalImage(url: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Gera tamanhos responsivos padrão para diferentes tipos de imagem
 */
export function getResponsiveSizes(
  type: 'thumbnail' | 'product-card' | 'product-detail' | 'banner' | 'hero' | 'avatar' | 'category'
): string {
  const sizesMap: Record<string, string> = {
    'thumbnail': thumbnailImageSizes,
    'product-card': productImageSizes,
    'product-detail': '(max-width: 768px) 100vw, 50vw',
    'banner': bannerImageSizes,
    'hero': heroImageSizes,
    'avatar': '48px',
    'category': categoryImageSizes,
  };
  
  return sizesMap[type] || '100vw';
}

/**
 * Configuração de domínios remotos para next.config.ts
 */
export const remotePatterns = [
  {
    protocol: 'https' as const,
    hostname: 'res.cloudinary.com',
  },
  {
    protocol: 'https' as const,
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https' as const,
    hostname: '**.cloudinary.com',
  },
  {
    protocol: 'https' as const,
    hostname: 'cdn.ussbrasil.com',
  },
  {
    protocol: 'https' as const,
    hostname: 'i.ibb.co',
  },
  {
    protocol: 'https' as const,
    hostname: 'www.ussbrasil.com.br',
  },
  {
    protocol: 'https' as const,
    hostname: '**.ussbrasil.com.br',
  },
];

/**
 * Calcula dimensões proporcionais mantendo aspect ratio
 */
export function calculateProportionalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Formato de imagem preferido baseado no suporte do navegador
 */
export function getPreferredImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') {
    return 'webp';
  }

  if (supportsAVIF()) {
    return 'avif';
  }
  
  if (supportsWebP()) {
    return 'webp';
  }
  
  return 'jpg';
}

export default {
  imageLoader,
  optimizeCloudinaryUrl,
  optimizedImageProps,
  generateSrcSet,
  normalizeImageUrl,
  isExternalImage,
  getResponsiveSizes,
  remotePatterns,
  calculateProportionalDimensions,
  getPreferredImageFormat,
  supportsWebP,
  supportsAVIF,
  DEFAULT_BLUR_DATA_URL,
  FALLBACK_IMAGE,
};
