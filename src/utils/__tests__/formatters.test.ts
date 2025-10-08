import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../formatters';

describe('formatCurrency', () => {
  it('deve formatar valores corretamente', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00');
    expect(formatCurrency(1000)).toBe('R$ 1.000,00');
    expect(formatCurrency(1000.50)).toBe('R$ 1.000,50');
  });

  it('deve lidar com valores zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('deve lidar com valores negativos', () => {
    expect(formatCurrency(-100)).toBe('-R$ 100,00');
  });

  it('deve arredondar casas decimais', () => {
    expect(formatCurrency(10.999)).toBe('R$ 11,00');
    expect(formatCurrency(10.001)).toBe('R$ 10,00');
  });
});
