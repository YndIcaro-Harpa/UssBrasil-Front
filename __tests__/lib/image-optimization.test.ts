import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  optimizeCloudinaryUrl, 
  normalizeImageUrl, 
  isExternalImage,
  generateSrcSet,
  getResponsiveSizes,
  calculateProportionalDimensions,
} from '@/lib/image-optimization';

describe('Image Optimization Utilities', () => {
  describe('normalizeImageUrl', () => {
    it('should return fallback for empty url', () => {
      expect(normalizeImageUrl('')).toBe('/images/placeholder-product.jpg');
    });

    it('should return fallback for undefined url', () => {
      expect(normalizeImageUrl(undefined as any)).toBe('/images/placeholder-product.jpg');
    });

    it('should add https to protocol-relative url', () => {
      expect(normalizeImageUrl('//example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });

    it('should return url unchanged if it has protocol', () => {
      expect(normalizeImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });

    it('should return local path unchanged', () => {
      expect(normalizeImageUrl('/images/test.jpg')).toBe('/images/test.jpg');
    });
  });

  describe('isExternalImage', () => {
    it('should return true for http urls', () => {
      expect(isExternalImage('http://example.com/image.jpg')).toBe(true);
    });

    it('should return true for https urls', () => {
      expect(isExternalImage('https://example.com/image.jpg')).toBe(true);
    });

    it('should return true for protocol-relative urls', () => {
      expect(isExternalImage('//example.com/image.jpg')).toBe(true);
    });

    it('should return false for local paths', () => {
      expect(isExternalImage('/images/test.jpg')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isExternalImage('')).toBe(false);
    });
  });

  describe('optimizeCloudinaryUrl', () => {
    const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

    it('should return original url if not cloudinary', () => {
      const normalUrl = 'https://example.com/image.jpg';
      expect(optimizeCloudinaryUrl(normalUrl)).toBe(normalUrl);
    });

    it('should add transformations to cloudinary url', () => {
      const result = optimizeCloudinaryUrl(cloudinaryUrl, { width: 300 });
      expect(result).toContain('w_300');
    });

    it('should add quality transformation', () => {
      const result = optimizeCloudinaryUrl(cloudinaryUrl, { quality: 80 });
      expect(result).toContain('q_80');
    });

    it('should add format transformation', () => {
      const result = optimizeCloudinaryUrl(cloudinaryUrl, { format: 'webp' });
      expect(result).toContain('f_webp');
    });

    it('should handle empty url', () => {
      expect(optimizeCloudinaryUrl('')).toBe('');
    });
  });

  describe('generateSrcSet', () => {
    it('should return empty string for empty url', () => {
      expect(generateSrcSet('')).toBe('');
    });

    it('should generate srcset for cloudinary urls', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const srcSet = generateSrcSet(cloudinaryUrl, [320, 640]);
      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
    });

    it('should generate srcset for normal urls', () => {
      const normalUrl = '/images/test.jpg';
      const srcSet = generateSrcSet(normalUrl, [320, 640]);
      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
    });
  });

  describe('getResponsiveSizes', () => {
    it('should return correct sizes for thumbnail', () => {
      expect(getResponsiveSizes('thumbnail')).toBe('80px');
    });

    it('should return correct sizes for hero', () => {
      expect(getResponsiveSizes('hero')).toBe('100vw');
    });

    it('should return default for unknown type', () => {
      expect(getResponsiveSizes('unknown' as any)).toBe('100vw');
    });
  });

  describe('calculateProportionalDimensions', () => {
    it('should scale down width if exceeds max', () => {
      const result = calculateProportionalDimensions(2000, 1000, 1000, 1000);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(500);
    });

    it('should scale down height if exceeds max', () => {
      const result = calculateProportionalDimensions(500, 2000, 1000, 1000);
      expect(result.width).toBe(250);
      expect(result.height).toBe(1000);
    });

    it('should not scale if within limits', () => {
      const result = calculateProportionalDimensions(500, 500, 1000, 1000);
      expect(result.width).toBe(500);
      expect(result.height).toBe(500);
    });

    it('should maintain aspect ratio', () => {
      const result = calculateProportionalDimensions(1600, 900, 800, 800);
      const originalRatio = 1600 / 900;
      const newRatio = result.width / result.height;
      expect(Math.abs(originalRatio - newRatio)).toBeLessThan(0.01);
    });
  });
});
