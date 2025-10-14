import { useState } from 'react';
import { Tag, Loader2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ValidateCouponResponse } from '@/services/coupon';

interface CouponInputProps {
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  appliedCoupon: ValidateCouponResponse | null;
  isLoading: boolean;
  disabled?: boolean;
}

export function CouponInput({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  isLoading,
  disabled = false
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom');
      return;
    }

    setError(null);
    try {
      await onApplyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    } catch (err: any) {
      setError(err.message || 'Erro ao aplicar cupom');
    }
  };

  const handleRemove = () => {
    setCouponCode('');
    setError(null);
    onRemoveCoupon();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  // Se já tem cupom aplicado, mostrar estado de sucesso
  if (appliedCoupon && appliedCoupon.valid) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Cupom de Desconto
        </label>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-900">
              {appliedCoupon.coupon?.code}
            </p>
            <p className="text-xs text-green-700">
              {appliedCoupon.message}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isLoading}
            className="flex-shrink-0 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {appliedCoupon.coupon?.description && (
          <p className="text-xs text-gray-600">
            {appliedCoupon.coupon.description}
          </p>
        )}
      </div>
    );
  }

  // Estado normal de input
  return (
    <div className="space-y-2">
      <label htmlFor="coupon-input" className="text-sm font-medium text-gray-700">
        Cupom de Desconto
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="coupon-input"
            type="text"
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            disabled={disabled || isLoading}
            className={`pl-10 uppercase ${error ? 'border-red-500' : ''}`}
            maxLength={50}
          />
        </div>
        <Button
          type="button"
          onClick={handleApply}
          disabled={disabled || isLoading || !couponCode.trim()}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Digite um código promocional para obter desconto
      </p>
    </div>
  );
}

export default CouponInput;
