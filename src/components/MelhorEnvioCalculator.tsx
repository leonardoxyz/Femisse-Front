/**
 * COMPONENTE DE CALCULADORA DE FRETE - MELHOR ENVIO
 * 
 * Calcula cotações reais usando a API do MelhorEnvio
 */

import { useState, useEffect } from 'react';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { useShipping } from '@/hooks/useShipping';
import { calculateProductDimensions } from '@/services/shipping';
import type { ShippingQuote } from '@/services/shipping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '../utils/logger-unified';

interface MelhorEnvioCalculatorProps {
  products: any[];
  fromZipCode?: string;
  onSelectQuote?: (quote: ShippingQuote) => void;
  selectedQuoteId?: number;
  className?: string;
}

export function MelhorEnvioCalculator({
  products,
  fromZipCode = '14870-390',
  onSelectQuote,
  selectedQuoteId,
  className = ''
}: MelhorEnvioCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { loading, quotes, calculateShipping, authorized, checkAuthorization } = useShipping();

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  const handleCalculate = async () => {
    if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) {
      return;
    }

    const cleanZip = zipCode.replace(/\D/g, '');
    
    // Converte produtos para formato MelhorEnvio
    const shippingProducts = products.map(product => 
      calculateProductDimensions({
        ...product,
        quantity: product.quantity || 1
      })
    );

    try {
      await calculateShipping({
        fromZipCode,
        toZipCode: cleanZip,
        products: shippingProducts
      });
      
      setShowResults(true);
    } catch (error) {
      logger.error('Erro ao calcular frete:', error);
    }
  };

  const handleZipCodeChange = (value: string) => {
    // Formata CEP: 00000-000
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    const formatted = cleaned.length > 5 
      ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
      : cleaned;
    setZipCode(formatted);
    setShowResults(false);
  };

  const handleSelectQuote = (quote: ShippingQuote) => {
    onSelectQuote?.(quote);
  };

  if (!authorized) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-amber-600">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Cálculo de frete indisponível</p>
              <p className="text-xs text-gray-600">
                O administrador precisa autorizar o MelhorEnvio para calcular fretes reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input de CEP */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Calcular Frete
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="00000-000"
            value={zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCalculate();
              }
            }}
            className="flex-1"
            maxLength={9}
          />
          <Button
            onClick={handleCalculate}
            disabled={loading || !zipCode || zipCode.replace(/\D/g, '').length !== 8}
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Digite seu CEP para ver as opções de entrega
        </p>
      </div>

      {/* Resultados */}
      {showResults && quotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">
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
                      
                      {quote.delivery_range && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prazo: {quote.delivery_range.min} a {quote.delivery_range.max} dias
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-gray-900">
                      R$ {(quote.custom_price || quote.price).toFixed(2)}
                    </div>
                    
                    {quote.discount > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Economia: R$ {quote.discount.toFixed(2)}
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
      )}

      {/* Sem resultados */}
      {showResults && quotes.length === 0 && !loading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-gray-600">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Nenhuma opção disponível</p>
                <p className="text-xs">
                  Não encontramos opções de frete para este CEP. 
                  Verifique se o CEP está correto ou entre em contato conosco.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MelhorEnvioCalculator;
