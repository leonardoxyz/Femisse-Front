export function formatCurrency(value: number | null | undefined, locale = 'pt-BR', currency = 'BRL'): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'R$ 0,00';
  }

  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
  });
}

export function formatCep(cep: string | null | undefined): string {
  if (!cep) return '';

  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return cep;

  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
}
