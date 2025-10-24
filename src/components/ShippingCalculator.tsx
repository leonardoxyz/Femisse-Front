import React from "react";
import { useShipping, ShippingAddress } from "@/contexts/ShippingContext";
import { logger } from '../utils/logger-unified';

export interface ShippingCalculatorResult {
  cep: string;
  shippingCost: number | null;
  address: ShippingAddress | null;
  isFreeShipping: boolean;
}

interface ShippingCalculatorProps {
  subtotal: number;
  freeShippingTarget?: number;
  onResult?: (result: ShippingCalculatorResult) => void;
  className?: string;
  title?: string;
  minimal?: boolean;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  subtotal,
  freeShippingTarget = 389,
  onResult,
  className,
  title = 'Meios de envio',
  minimal = false,
}) => {
  const { shippingInfo, updateShippingInfo } = useShipping();
  const [cep, setCep] = React.useState<string>(shippingInfo.cep ?? '');
  const [cepLoading, setCepLoading] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<ShippingAddress | null>(shippingInfo.address ?? null);
  const [shippingCost, setShippingCost] = React.useState<number | null>(shippingInfo.shippingCost ?? null);

  React.useEffect(() => {
    setCep(shippingInfo.cep ?? '');
    setAddress(shippingInfo.address ?? null);
    setShippingCost(shippingInfo.shippingCost ?? null);
  }, [shippingInfo.cep, shippingInfo.address, shippingInfo.shippingCost]);

  const freeShippingAchieved = !!address && subtotal >= freeShippingTarget && (shippingCost ?? 0) === 0;

  const pushResult = React.useCallback((nextCep: string, nextShipping: number | null, nextAddress: ShippingAddress | null, source: "manual" | "auto" | null) => {
    updateShippingInfo({ cep: nextCep, shippingCost: nextShipping, address: nextAddress, source });
    onResult?.({
      cep: nextCep,
      shippingCost: nextShipping,
      address: nextAddress,
      isFreeShipping: !!nextAddress && nextShipping === 0,
    });
  }, [updateShippingInfo, onResult]);

  const calculateShippingCost = React.useCallback((targetCep: string) => {
    if (subtotal >= freeShippingTarget) {
      return 0;
    }
    const firstDigit = parseInt(targetCep[0], 10);
    if (Number.isNaN(firstDigit)) return null;
    if (firstDigit <= 2) return 19.9; // Sudeste
    if (firstDigit <= 5) return 24.9; // Sul / Centro-Oeste
    if (firstDigit <= 8) return 29.9; // Nordeste
    return 34.9; // Norte
  }, [subtotal, freeShippingTarget]);

  const handleResultUpdate = React.useCallback((nextCep: string, nextAddress: ShippingAddress | null, nextShipping: number | null, source: "manual" | "auto" | null = null) => {
    setCep(nextCep);
    setAddress(nextAddress);
    setShippingCost(nextShipping);
    pushResult(nextCep, nextShipping, nextAddress, source);
  }, [pushResult]);

  const handleCalculateShipping = React.useCallback(async (inputCep?: string, source: "manual" | "auto" = "manual") => {
    const sanitized = (inputCep ?? cep).replace(/\D/g, '').slice(0, 8);
    if (!inputCep) {
      setCep(sanitized);
    }
    setCepError(null);

    if (sanitized.length !== 8) {
      handleResultUpdate(sanitized, null, null, null);
      setCepError('Informe um CEP válido (8 dígitos).');
      return;
    }

    try {
      setCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${sanitized}/json/`);
      const data = await response.json();
      if (data?.erro) {
        handleResultUpdate(sanitized, null, null, null);
        setCepError('CEP não encontrado.');
        return;
      }

      const cost = calculateShippingCost(sanitized);
      if (cost === null) {
        handleResultUpdate(sanitized, null, null, null);
        setCepError('Não foi possível calcular o frete.');
        return;
      }

      handleResultUpdate(sanitized, data, cost, source);
    } catch (error) {
      logger.error('Erro ao calcular frete:', error);
      handleResultUpdate(sanitized, null, null, null);
      setCepError('Não foi possível calcular o frete. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  }, [calculateShippingCost, cep, handleResultUpdate]);

  const resolveCepFromCoords = React.useCallback(async (latitude: number, longitude: number) => {
    try {
      const baseParams = `format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`;
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${baseParams}`);
      const result = await response.json();
      let postalCode = (result?.address?.postcode || '').replace(/\D/g, '');

      if (postalCode.length !== 8) {
        const fallback = await fetch('https://ipapi.co/json/');
        const fallbackData = await fallback.json();
        postalCode = (fallbackData?.postal || '').replace(/\D/g, '');
      }

      if (postalCode.length !== 8) {
        setCepError('Não foi possível identificar um CEP válido em sua localização.');
        return;
      }

      await handleCalculateShipping(postalCode, "auto");
    } catch (error) {
      logger.error('Erro ao obter CEP por localização:', error);
      setCepError('Não foi possível obter o CEP pela sua localização.');
    }
  }, [handleCalculateShipping]);

  const handleUseMyLocation = React.useCallback(() => {
    if (!navigator?.geolocation) {
      setCepError('Geolocalização não suportada neste dispositivo.');
      return;
    }
    setLocating(true);
    setCepError(null);

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      await resolveCepFromCoords(coords.latitude, coords.longitude);
      setLocating(false);
    }, (geoError) => {
      logger.error('Permissão de localização negada ou indisponível:', geoError);
      setLocating(false);
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setCepError('Permita o acesso à sua localização para buscar o CEP automaticamente.');
          break;
        case geoError.POSITION_UNAVAILABLE:
          setCepError('Sua localização não está disponível no momento.');
          break;
        case geoError.TIMEOUT:
          setCepError('Tempo esgotado ao obter sua localização.');
          break;
        default:
          setCepError('Não foi possível obter sua localização.');
      }
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }, [resolveCepFromCoords]);

  React.useEffect(() => {
    if (!address || !cep) return;

    if (subtotal >= freeShippingTarget) {
      if (shippingCost !== 0) {
        handleResultUpdate(cep, address, 0, shippingInfo.source ?? null);
      }
    } else if (shippingCost === 0) {
      const recalculated = calculateShippingCost(cep);
      handleResultUpdate(cep, address, recalculated, shippingInfo.source ?? null);
    }
  }, [address, cep, subtotal, freeShippingTarget, calculateShippingCost, shippingCost, handleResultUpdate, shippingInfo.source]);

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {!minimal && (
        <div className="text-[13px] text-zinc-800 font-medium">{title}</div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
            setCep(value);
          }}
          placeholder="Seu CEP"
          className="flex-1 border rounded px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-zinc-300"
        />
        <button
          className={`px-3 py-2 text-[13px] rounded text-white ${cepLoading || locating ? 'bg-zinc-400 cursor-wait' : 'bg-primary'}`}
          onClick={() => handleCalculateShipping()}
          disabled={cepLoading || locating}
        >
          {cepLoading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>
      <button
        className="mt-1 text-[12px] underline text-zinc-600"
        onClick={handleUseMyLocation}
        disabled={locating || cepLoading}
      >
        {locating ? 'Buscando sua localização...' : 'Não sei meu CEP'}
      </button>
      {cepError && <div className="text-[12px] text-red-600 mt-1">{cepError}</div>}

      {address && (
        <div className="mt-3 text-[12px] text-zinc-700 border rounded p-3 space-y-1">
          <div className="font-medium text-zinc-800">Endereço para entrega</div>
          <div>
            {address.logradouro || '—'} {address.complemento ? `- ${address.complemento}` : ''}
          </div>
          <div>
            {address.bairro ? `${address.bairro} • ` : ''}
            {address.localidade}/{address.uf}
          </div>
          <div>CEP {address.cep}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-zinc-700">Frete</span>
            <span className="text-zinc-900 font-medium">
              {freeShippingAchieved ? 'GRÁTIS' : formatBRL(shippingCost ?? 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
