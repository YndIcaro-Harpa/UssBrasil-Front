/**
 * Testes Unitários para Tipos de Produto Unificados
 */

import {
  normalizeProduct,
  parseImages,
  stringifyArray,
  parseSpecifications,
  calculateDiscountPrice,
  calculateDiscountPercent,
  type Product,
  type ProductSpecifications,
} from '../../types/product-unified';

describe('Product Unified Types', () => {
  describe('normalizeProduct', () => {
    it('deve normalizar um produto com campos mínimos', () => {
      const input = { id: '1', name: 'Test', slug: 'test', price: 100 };
      const result = normalizeProduct(input);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test');
      expect(result.price).toBe(100);
      expect(result.rating).toBe(4.5);
      expect(result.reviews).toBe(0);
      expect(result.isActive).toBe(true);
      expect(result.inStock).toBe(false);
    });

    it('deve normalizar um produto completo', () => {
      const input: Partial<Product> = {
        id: '1',
        name: 'iPhone 16',
        slug: 'iphone-16',
        price: 5999,
        discountPrice: 5499,
        stock: 50,
        rating: 4.8,
        reviews: 100,
        isFeatured: true,
        images: '/img1.jpg,/img2.jpg',
      };
      const result = normalizeProduct(input);

      expect(result.stock).toBe(50);
      expect(result.rating).toBe(4.8);
      expect(result.reviews).toBe(100);
      expect(result.inStock).toBe(true);
      expect(result.isFeatured).toBe(true);
      expect(result.featured).toBe(true);
    });

    it('deve extrair imagem de string de imagens', () => {
      const input = {
        id: '1',
        name: 'Test',
        slug: 'test',
        price: 100,
        images: '/img1.jpg,/img2.jpg,/img3.jpg',
      };
      const result = normalizeProduct(input);

      expect(result.image).toBe('/img1.jpg');
    });

    it('deve extrair imagem de array de imagens', () => {
      const input = {
        id: '1',
        name: 'Test',
        slug: 'test',
        price: 100,
        images: ['/img1.jpg', '/img2.jpg'],
      };
      const result = normalizeProduct(input);

      expect(result.image).toBe('/img1.jpg');
    });
  });

  describe('parseImages', () => {
    it('deve retornar array vazio para undefined', () => {
      expect(parseImages(undefined)).toEqual([]);
    });

    it('deve retornar array vazio para string vazia', () => {
      expect(parseImages('')).toEqual([]);
    });

    it('deve converter string separada por vírgula em array', () => {
      const result = parseImages('/img1.jpg, /img2.jpg, /img3.jpg');
      expect(result).toEqual(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
    });

    it('deve retornar array como está', () => {
      const input = ['/img1.jpg', '/img2.jpg'];
      expect(parseImages(input)).toEqual(input);
    });

    it('deve filtrar valores vazios', () => {
      const result = parseImages('/img1.jpg,,/img2.jpg,');
      expect(result).toEqual(['/img1.jpg', '/img2.jpg']);
    });
  });

  describe('stringifyArray', () => {
    it('deve retornar string vazia para undefined', () => {
      expect(stringifyArray(undefined)).toBe('');
    });

    it('deve retornar string como está', () => {
      expect(stringifyArray('a,b,c')).toBe('a,b,c');
    });

    it('deve converter array para string', () => {
      expect(stringifyArray(['a', 'b', 'c'])).toBe('a,b,c');
    });
  });

  describe('parseSpecifications', () => {
    it('deve retornar objeto vazio para undefined', () => {
      expect(parseSpecifications(undefined)).toEqual({});
    });

    it('deve parsear JSON string', () => {
      const json = '{"processor": "A18", "storage": "256GB"}';
      const result = parseSpecifications(json);
      expect(result).toEqual({ processor: 'A18', storage: '256GB' });
    });

    it('deve retornar objeto vazio para JSON inválido', () => {
      expect(parseSpecifications('invalid json')).toEqual({});
    });

    it('deve retornar objeto como está', () => {
      const specs: ProductSpecifications = { processor: 'M3' };
      expect(parseSpecifications(specs)).toEqual(specs);
    });
  });

  describe('calculateDiscountPrice', () => {
    it('deve retornar preço original sem desconto', () => {
      expect(calculateDiscountPrice(100)).toBe(100);
      expect(calculateDiscountPrice(100, 0)).toBe(100);
      expect(calculateDiscountPrice(100, -10)).toBe(100);
    });

    it('deve calcular preço com desconto', () => {
      expect(calculateDiscountPrice(100, 10)).toBe(90);
      expect(calculateDiscountPrice(100, 25)).toBe(75);
      expect(calculateDiscountPrice(1000, 15)).toBe(850);
    });
  });

  describe('calculateDiscountPercent', () => {
    it('deve retornar 0 para preços inválidos', () => {
      expect(calculateDiscountPercent(0, 100)).toBe(0);
      expect(calculateDiscountPercent(100, 100)).toBe(0);
      expect(calculateDiscountPercent(100, 150)).toBe(0);
    });

    it('deve calcular porcentagem de desconto', () => {
      expect(calculateDiscountPercent(100, 90)).toBe(10);
      expect(calculateDiscountPercent(100, 75)).toBe(25);
      expect(calculateDiscountPercent(1000, 850)).toBe(15);
    });

    it('deve arredondar corretamente', () => {
      expect(calculateDiscountPercent(100, 67)).toBe(33);
      expect(calculateDiscountPercent(100, 33)).toBe(67);
    });
  });
});
