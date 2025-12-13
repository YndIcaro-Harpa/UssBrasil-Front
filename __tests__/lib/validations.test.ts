/**
 * Testes para Validações do Sistema
 */

import {
  validateEmail,
  validatePassword,
  validateCPF,
  validatePhone,
  validateCEP,
  formatCPF,
  formatPhone,
  formatCEP,
  formatCurrency,
} from '../../lib/validations';

describe('Validations', () => {
  describe('validateEmail', () => {
    it('deve validar emails corretos', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.com.br')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senhas fortes', () => {
      expect(validatePassword('Abc12345')).toBe(true);
      expect(validatePassword('SecurePass123')).toBe(true);
    });

    it('deve rejeitar senhas fracas', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('abcdefgh')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPFs corretos', () => {
      expect(validateCPF('529.982.247-25')).toBe(true);
      expect(validateCPF('52998224725')).toBe(true);
    });

    it('deve rejeitar CPFs inválidos', () => {
      expect(validateCPF('000.000.000-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('invalid')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefones corretos', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('(11) 9999-9999')).toBe(true);
    });

    it('deve rejeitar telefones inválidos', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEPs corretos', () => {
      expect(validateCEP('01310-100')).toBe(true);
      expect(validateCEP('01310100')).toBe(true);
    });

    it('deve rejeitar CEPs inválidos', () => {
      expect(validateCEP('123')).toBe(false);
      expect(validateCEP('')).toBe(false);
    });
  });
});

describe('Formatters', () => {
  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('52998224725')).toBe('529.982.247-25');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone corretamente', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
      expect(formatPhone('1199999999')).toBe('(11) 9999-9999');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCEP('01310100')).toBe('01310-100');
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valores em Real', () => {
      // Usa regex para lidar com diferentes caracteres de espaço (normal e non-breaking)
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(formatCurrency(99.99)).toMatch(/R\$\s*99,99/);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });
  });
});
