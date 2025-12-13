/**
 * Testes para Utilitários
 */

import { slugify } from '../../lib/slugify';
import { cn } from '../../lib/utils';

describe('Slugify', () => {
  it('deve converter texto para slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('iPhone 16 Pro Max')).toBe('iphone-16-pro-max');
    expect(slugify('JBL Tune 670NC')).toBe('jbl-tune-670nc');
  });

  it('deve remover acentos', () => {
    expect(slugify('São Paulo')).toBe('sao-paulo');
    expect(slugify('Música & Ação')).toBe('musica-acao');
    expect(slugify('Café com Leite')).toBe('cafe-com-leite');
  });

  it('deve remover caracteres especiais', () => {
    expect(slugify('Product @ 50% off!')).toBe('product-50-off');
    expect(slugify('Price: $100.00')).toBe('price-10000');
  });

  it('deve lidar com múltiplos espaços', () => {
    expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    expect(slugify('  Trim  Edges  ')).toBe('trim-edges');
  });
});

describe('cn (classNames)', () => {
  it('deve combinar classes simples', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('deve filtrar valores falsy', () => {
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2');
  });

  it('deve resolver conflitos do Tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
