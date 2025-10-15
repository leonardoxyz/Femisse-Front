/**
 * COMPONENTE DE CÁLCULO DE FRETE PARA CHECKOUT
 * 
 * Integrado com MelhorEnvio API
 */

import { useState, useEffect } from 'react';
import { Package, Truck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useShipping as useMelhorEnvio } from '@/hooks/useShipping';
import { calculateProductDimensions } from '@/services/shipping';
import type { ShippingQuote } from '@/services/shipping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface ShippingCalculatorProps {
  products: any[];
  selectedAddress?: {
    zip_code: string;
  };
  onSelectQuote?: (quote: ShippingQuote | null, cost: number) => void;
  className?: string;
}

const STORE_ZIP_CODE = '14870-390'; // CEP da loja

export function ShippingCalculator({
  products,
  selectedAddress,
  onSelectQuote,
  className = ''
}: ShippingCalculatorProps) {
  const parseAmount = (value: number | string | undefined | null): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };

  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const { loading, quotes, calculateShipping, authorized, checkAuthorization } = useMelhorEnvio();

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  // Calcula automaticamente quando endereço é selecionado
  useEffect(() => {
    if (selectedAddress?.zip_code && authorized && products.length > 0) {
      handleCalculate();
    }
  }, [selectedAddress?.zip_code, authorized]);

  const handleCalculate = async () => {
    if (!selectedAddress?.zip_code) {
      return;
    }

    const cleanZip = selectedAddress.zip_code.replace(/\D/g, '');
    
    if (cleanZip.length !== 8) {
      return;
    }

    // Converte produtos para formato MelhorEnvio
    const shippingProducts = products.map(product => 
      calculateProductDimensions({
        ...product,
        quantity: product.quantity || 1
      })
    );

    try {
      await calculateShipping({
        fromZipCode: STORE_ZIP_CODE,
        toZipCode: cleanZip,
        products: shippingProducts
      });
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    }
  };

  const handleSelectQuote = (quote: ShippingQuote) => {
    setSelectedQuoteId(quote.id);
    const price = parseAmount(quote.custom_price ?? quote.price);
    onSelectQuote?.(quote, price);
  };

  // Se não autorizado, mostra mensagem informativa
  if (authorized === false) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-amber-600">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Cálculo de frete via MelhorEnvio indisponível</p>
              <p className="text-xs text-gray-600">
                O sistema está usando valores de frete padrão. Para habilitar o cálculo em tempo real, 
                o administrador precisa autorizar a integração com o MelhorEnvio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Ainda verificando autorização
  if (authorized === null) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Verificando disponibilidade...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem endereço selecionado
  if (!selectedAddress) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Package className="w-5 h-5" />
            <span className="text-sm">Selecione um endereço para calcular o frete</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Calculando opções de frete...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Resultados
  if (quotes.length > 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Opções de Envio:
        </h3>
        
        {quotes.map((quote) => (
          <Card
            key={quote.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedQuoteId === quote.id
                ? 'ring-2 ring-primary border-primary'
                : 'border-gray-200'
            }`}
            onClick={() => handleSelectQuote(quote)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Informações da transportadora */}
                <div className="flex items-start gap-3 flex-1">
                  {quote.company.picture && (
                    <img
                      src={quote.company.picture}
                      alt={quote.company.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {quote.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{quote.company.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {quote.custom_delivery_time || quote.delivery_time} dias úteis
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preço */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(parseAmount(quote.custom_price ?? quote.price))}
                  </div>
                  
                  {quote.discount > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Economia: {formatCurrency(parseAmount(quote.discount))}
                    </div>
                  )}
                  
                  {selectedQuoteId === quote.id && (
                    <div className="text-xs text-primary font-medium mt-1">
                      ✓ Selecionado
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Sem resultados
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 text-gray-600">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Nenhuma opção disponível</p>
            <p className="text-xs">
              Não encontramos opções de frete para este endereço. 
              Entre em contato conosco para mais informações.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShippingCalculator;
