import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Product Utilities', () => {
  describe('Price Formatting', () => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };

    it('should format whole numbers', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00');
    });

    it('should format decimal numbers', () => {
      expect(formatCurrency(99.99)).toBe('R$ 99,99');
    });

    it('should format large numbers with thousand separators', () => {
      expect(formatCurrency(1999.90)).toBe('R$ 1.999,90');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });
  });

  describe('Discount Calculation', () => {
    const calculateDiscount = (original: number, discounted: number) => {
      if (original <= 0) return 0;
      return Math.round(((original - discounted) / original) * 100);
    };

    it('should calculate percentage discount correctly', () => {
      expect(calculateDiscount(100, 80)).toBe(20);
      expect(calculateDiscount(1000, 750)).toBe(25);
    });

    it('should return 0 for no discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('should handle zero original price', () => {
      expect(calculateDiscount(0, 50)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateDiscount(100, 67)).toBe(33);
    });
  });

  describe('Stock Status', () => {
    const getStockStatus = (quantity: number) => {
      if (quantity <= 0) return { label: 'Indisponível', color: 'red' };
      if (quantity <= 5) return { label: 'Últimas unidades', color: 'orange' };
      if (quantity <= 20) return { label: 'Estoque baixo', color: 'yellow' };
      return { label: 'Em estoque', color: 'green' };
    };

    it('should return unavailable for 0 stock', () => {
      expect(getStockStatus(0)).toEqual({ label: 'Indisponível', color: 'red' });
    });

    it('should return last units for low stock', () => {
      expect(getStockStatus(3)).toEqual({ label: 'Últimas unidades', color: 'orange' });
    });

    it('should return low stock for medium inventory', () => {
      expect(getStockStatus(15)).toEqual({ label: 'Estoque baixo', color: 'yellow' });
    });

    it('should return in stock for high inventory', () => {
      expect(getStockStatus(100)).toEqual({ label: 'Em estoque', color: 'green' });
    });
  });

  describe('Product Slug Generation', () => {
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    it('should convert to lowercase', () => {
      expect(generateSlug('iPhone 15 Pro')).toBe('iphone-15-pro');
    });

    it('should remove accents', () => {
      expect(generateSlug('Câmera Módulo')).toBe('camera-modulo');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Apple Watch Ultra')).toBe('apple-watch-ultra');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Product (New!) @2024')).toBe('product-new-2024');
    });
  });

  describe('Rating Display', () => {
    const getRatingStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      
      return { full: fullStars, half: hasHalfStar ? 1 : 0, empty: emptyStars };
    };

    it('should calculate full rating', () => {
      expect(getRatingStars(5)).toEqual({ full: 5, half: 0, empty: 0 });
    });

    it('should calculate rating with half star', () => {
      expect(getRatingStars(4.5)).toEqual({ full: 4, half: 1, empty: 0 });
    });

    it('should calculate partial rating', () => {
      expect(getRatingStars(3.5)).toEqual({ full: 3, half: 1, empty: 1 });
    });

    it('should round down for less than half', () => {
      expect(getRatingStars(3.3)).toEqual({ full: 3, half: 0, empty: 2 });
    });
  });

  describe('Review Summary', () => {
    const calculateReviewSummary = (reviews: { rating: number }[]) => {
      if (reviews.length === 0) {
        return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
      }

      const distribution = [0, 0, 0, 0, 0];
      let total = 0;

      reviews.forEach((review) => {
        total += review.rating;
        distribution[review.rating - 1]++;
      });

      return {
        average: Math.round((total / reviews.length) * 10) / 10,
        count: reviews.length,
        distribution,
      };
    };

    it('should calculate average rating', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
      ];
      const result = calculateReviewSummary(reviews);
      expect(result.average).toBe(4.3);
    });

    it('should count reviews correctly', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ];
      expect(calculateReviewSummary(reviews).count).toBe(3);
    });

    it('should calculate distribution', () => {
      const reviews = [
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
      ];
      const result = calculateReviewSummary(reviews);
      expect(result.distribution).toEqual([0, 0, 1, 1, 2]);
    });

    it('should handle empty reviews', () => {
      expect(calculateReviewSummary([])).toEqual({
        average: 0,
        count: 0,
        distribution: [0, 0, 0, 0, 0],
      });
    });
  });
});

describe('Product Filters', () => {
  const products = [
    { id: 1, name: 'iPhone 15', price: 5999, category: 'phones', brand: 'Apple' },
    { id: 2, name: 'Galaxy S24', price: 4999, category: 'phones', brand: 'Samsung' },
    { id: 3, name: 'AirPods Pro', price: 1999, category: 'audio', brand: 'Apple' },
    { id: 4, name: 'MacBook Pro', price: 12999, category: 'laptops', brand: 'Apple' },
  ];

  describe('Category Filter', () => {
    it('should filter by category', () => {
      const filtered = products.filter((p) => p.category === 'phones');
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.name)).toEqual(['iPhone 15', 'Galaxy S24']);
    });
  });

  describe('Brand Filter', () => {
    it('should filter by brand', () => {
      const filtered = products.filter((p) => p.brand === 'Apple');
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Price Range Filter', () => {
    it('should filter by price range', () => {
      const minPrice = 2000;
      const maxPrice = 6000;
      const filtered = products.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice
      );
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters', () => {
      const filters = {
        category: 'phones',
        maxPrice: 5500,
      };
      const filtered = products.filter(
        (p) =>
          (!filters.category || p.category === filters.category) &&
          (!filters.maxPrice || p.price <= filters.maxPrice)
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Galaxy S24');
    });
  });

  describe('Sorting', () => {
    it('should sort by price ascending', () => {
      const sorted = [...products].sort((a, b) => a.price - b.price);
      expect(sorted[0].name).toBe('AirPods Pro');
      expect(sorted[sorted.length - 1].name).toBe('MacBook Pro');
    });

    it('should sort by price descending', () => {
      const sorted = [...products].sort((a, b) => b.price - a.price);
      expect(sorted[0].name).toBe('MacBook Pro');
    });

    it('should sort by name', () => {
      const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted[0].name).toBe('AirPods Pro');
    });
  });
});
