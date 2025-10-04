import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useShipping, ShippingAddress } from "@/contexts/ShippingContext";
import { Link, useNavigate } from "react-router-dom";

interface SidebarCartProps {
  open: boolean;
  onClose: () => void;
}

const SidebarCart: React.FC<SidebarCartProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = React.useState(open);
  const FREE_SHIPPING_TARGET = 120; // R$120,00
  const PIX_DISCOUNT_RATE = 0.05; // 5%
  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const { shippingInfo, updateShippingInfo } = useShipping();
  const [cep, setCep] = React.useState<string>(shippingInfo.cep ?? "");
  const [cepLoading, setCepLoading] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<ShippingAddress | null>(shippingInfo.address ?? null);
  const [shippingCost, setShippingCost] = React.useState<number | null>(shippingInfo.shippingCost ?? null);
  const [locatingCep, setLocatingCep] = React.useState(false);

  React.useEffect(() => {
    setCep(shippingInfo.cep ?? "");
    setAddress(shippingInfo.address ?? null);
    setShippingCost(shippingInfo.shippingCost ?? null);
  }, [shippingInfo.cep, shippingInfo.address, shippingInfo.shippingCost]);

  React.useEffect(() => {
    if (open) setShouldRender(true);
    else {
      // Aguarda a duração da animação antes de remover do DOM
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Fecha ao apertar ESC
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (shippingCost ?? 0);
  const pixTotal = Math.max(total - total * PIX_DISCOUNT_RATE, 0);
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_TARGET) * 100, 100);
  const remainingForFree = Math.max(FREE_SHIPPING_TARGET - subtotal, 0);
  const shippingCalculated = shippingCost !== null;
  const productListShouldScroll = cart.length > 4;

  const setShippingContext = React.useCallback((nextCep: string, nextAddress: ShippingAddress | null, nextCost: number | null, source: "manual" | "auto" | null = null) => {
    updateShippingInfo({ cep: nextCep, address: nextAddress, shippingCost: nextCost, source });
  }, [updateShippingInfo]);

  const calculateShippingCost = React.useCallback((targetCep: string) => {
    if (subtotal >= FREE_SHIPPING_TARGET) {
      return 0;
    }
    const first = parseInt(targetCep[0], 10);
    if (Number.isNaN(first)) return null;
    if (first <= 2) return 19.9;
    if (first <= 5) return 24.9;
    if (first <= 8) return 29.9;
    return 34.9;
  }, [subtotal]);

  const handleCalculateShipping = React.useCallback(async (inputCep?: string, source: "manual" | "auto" = "manual") => {
    const sanitized = (inputCep ?? cep).replace(/\D/g, "").slice(0, 8);
    setCep(sanitized);
    setCepError(null);
    if (sanitized.length !== 8) {
      setShippingCost(null);
      setAddress(null);
      setCepError('Informe um CEP válido (8 dígitos).');
      return;
    }
    try {
      setCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${sanitized}/json/`);
      const data = await response.json();
      const cost = calculateShippingCost(sanitized);
      if (cost === null) {
        setAddress(null);
        setShippingCost(null);
        setCepError('Não foi possível calcular o frete.');
        setShippingContext(sanitized, null, null, null);
      } else {
        setAddress(data);
        setShippingCost(cost);
        setShippingContext(sanitized, data, cost, source);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setAddress(null);
      setShippingCost(null);
      setCepError('Não foi possível calcular o frete. Tente novamente.');
      setShippingContext(sanitized, null, null, null);
    } finally {
      setCepLoading(false);
    }
  }, [calculateShippingCost, cep, setShippingContext]);

  const handleUseMyLocation = React.useCallback(() => {
    const applyCep = async (rawCep: string | null | undefined, source: "manual" | "auto") => {
      const sanitized = (rawCep || '').replace(/\D/g, '').slice(0, 8);
      if (sanitized.length === 8) {
        await handleCalculateShipping(sanitized, source);
        return true;
      }
      return false;
    };

    const resolveCepFromIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return false;
        const data = await response.json();
        return await applyCep(data?.postal, "auto");
      } catch (error) {
        console.error('Erro ao obter CEP via IP:', error);
        return false;
      }
    };

    const resolveCepFromCoords = async (latitude: number, longitude: number) => {
      const providers: Array<() => Promise<string | null>> = [
        async () => {
          try {
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;
            const result = await fetch(url);
            if (!result.ok) return null;
            const json = await result.json();
            return (json?.postcode || null);
          } catch (error) {
            console.error('Erro no BigDataCloud:', error);
            return null;
          }
        },
        async () => {
          try {
            const url = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`;
            const result = await fetch(url);
            if (!result.ok) return null;
            const json = await result.json();
            return (json?.address?.postcode || null);
          } catch (error) {
            console.error('Erro no Maps.co:', error);
            return null;
          }
        },
        async () => {
          try {
            const params = `format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=20&addressdetails=1&accept-language=pt-BR`;
            const result = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
            if (!result.ok) return null;
            const json = await result.json();
            return (json?.address?.postcode || null);
          } catch (error) {
            console.error('Erro no Nominatim:', error);
            return null;
          }
        }
      ];

      for (const provider of providers) {
        const candidate = await provider();
        if (candidate && await applyCep(candidate, "auto")) {
          return true;
        }
      }

      return false;
    };

    const attemptIPOnly = async () => {
      setLocatingCep(true);
      setCepError(null);
      const ipSuccess = await resolveCepFromIP();
      setLocatingCep(false);
      if (!ipSuccess) {
        setCepError('Não foi possível detectar seu CEP automaticamente. Por favor, informe manualmente.');
      }
    };

    if (!navigator?.geolocation) {
      attemptIPOnly();
      return;
    }

    setLocatingCep(true);
    setCepError(null);

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const coordSuccess = await resolveCepFromCoords(coords.latitude, coords.longitude);
      if (!coordSuccess) {
        const ipSuccess = await resolveCepFromIP();
        if (!ipSuccess) {
          setCepError('Não foi possível detectar seu CEP automaticamente. Por favor, informe manualmente.');
        }
      }
      setLocatingCep(false);
    }, (geoError) => {
      console.error('Permissão de localização negada ou indisponível:', geoError);
      setLocatingCep(false);
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
      maximumAge: 0
    });
  }, [handleCalculateShipping]);

  // Cores dinâmicas para a barra conforme o progresso
  const progressColor = freeShippingProgress >= 100
    ? 'bg-green-500'
    : freeShippingProgress >= 66
      ? 'bg-yellow-500'
      : 'bg-rose-500';
  const shouldPulse = freeShippingProgress >= 85 && freeShippingProgress < 100;

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Overlay escuro */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 animate-fade-in' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.40)' }}
        onClick={onClose}
        aria-label="Fechar carrinho"
      />
      {/* Sidebar animada */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transition-transform duration-500 ease-in-out
        ${open ? 'translate-x-0 animate-slide-in' : 'translate-x-full animate-slide-out'}`}
        style={{ boxShadow: open ? "-4px 0 24px 0 rgba(0,0,0,0.12)" : undefined }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-[15px] font-semibold text-zinc-800">Minha cestinha</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-primary text-2xl" aria-label="Fechar">&times;</button>
        </div>

        {/* Conteúdo */}
        <div className="px-4 py-3 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <p className="text-zinc-500 text-center mt-8">Seu carrinho está vazio.</p>
          ) : (
            <div className="space-y-4">
              <div
                className={`space-y-4 ${productListShouldScroll ? 'overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent' : ''}`}
                style={productListShouldScroll ? {
                  maxHeight: 'min(50vh, 360px)',
                  WebkitOverflowScrolling: 'touch'
                } : undefined}
              >
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded border object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="text-[13px] font-medium text-zinc-800 line-clamp-2 pr-2">
                          {item.name}
                          {item.size && (
                            <span className="block text-[12px] text-zinc-500 mt-0.5">Tamanho: {item.size}</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-[12px] text-zinc-500 hover:text-zinc-700"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center border rounded-md overflow-hidden">
                          <button
                            className="px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                            aria-label="Diminuir quantidade"
                          >
                            –
                          </button>
                          <span className="px-3 py-1 text-[12px] text-zinc-800">{item.quantity}</span>
                          <button
                            className="px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-[13px] font-semibold text-zinc-900">
                          {formatBRL(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Barra de frete grátis */}
              <div className="pt-2">
                <div className="relative w-full h-1.5 bg-zinc-200 rounded-full overflow-visible">
                  <div
                    className={`h-1.5 ${progressColor} rounded-full transition-all duration-500`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                  <div
                    className={`absolute -top-1.5 w-4 h-4 bg-primary border border-zinc-300 rounded-full shadow transition-all duration-500 ${shouldPulse ? 'animate-pulse' : ''}`}
                    style={{ left: `calc(${freeShippingProgress}% - 8px)` }}
                    aria-hidden
                  />
                </div>
                <div className="mt-2 text-[13px] text-zinc-800 font-medium">
                  {freeShippingProgress >= 100 ? (
                    <span className="text-green-600 font-semibold">Você ganhou frete grátis!</span>
                  ) : (
                    <>
                      <span className="font-semibold">Frete grátis</span> a partir de {formatBRL(FREE_SHIPPING_TARGET)}
                      <span className="ml-1 text-zinc-600">• Faltam {formatBRL(remainingForFree)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Subtotal */}
              <div className="pt-2 border-t" />
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-zinc-700">Subtotal (sem frete) :</span>
                <span className="text-zinc-900 font-medium">{formatBRL(subtotal)}</span>
              </div>

              <div>
                <div className="text-[13px] text-zinc-800 font-medium mb-2">Meios de envio</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setCep(v);
                    }}
                    placeholder="Seu CEP"
                    className="flex-1 border rounded px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-zinc-300"
                  />
                  <button
                    className={`px-3 py-2 text-[13px] rounded text-white ${cepLoading || locatingCep ? 'bg-zinc-400 cursor-wait' : 'bg-primary'}`}
                    onClick={() => handleCalculateShipping()}
                    disabled={cepLoading || locatingCep}
                  >
                    {cepLoading ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
                <button
                  className="mt-1 text-[12px] underline text-zinc-600"
                  onClick={handleUseMyLocation}
                  disabled={locatingCep || cepLoading}
                >
                  {locatingCep ? 'Buscando sua localização...' : 'Não sei meu CEP'}
                </button>
                {cepError && <div className="text-[12px] text-red-600 mt-1">{cepError}</div>}

                {/* Endereço resolvido */}
                {address && (
                  <div className="mt-3 text-[12px] text-zinc-700 border rounded p-3">
                    <div className="font-medium text-zinc-800 mb-1">Endereço para entrega</div>
                    <div>{address.logradouro || '—'} {address.bairro ? `- ${address.bairro}` : ''}</div>
                    <div>{address.localidade}/{address.uf} • CEP {address.cep}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-zinc-700">Frete</span>
                      <span className="text-zinc-900 font-medium">{subtotal >= FREE_SHIPPING_TARGET ? 'GRÁTIS' : formatBRL(shippingCost ?? 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-[14px] font-medium">
                <span className="text-zinc-800">Total:</span>
                <span className="text-zinc-900">{formatBRL(total)}</span>
              </div>
              <div className="text-[12px] text-zinc-600">Ou {formatBRL(pixTotal)} com Pix</div>
            </div>
          )}
        </div>

        {/* Footer ações */}
        <div className="px-4 py-3 border-t flex flex-col items-center gap-3">
          <>
          <button
              className={`w-full py-2 rounded-md text-[14px] font-medium text-white ${shippingCalculated ? 'bg-primary' : 'bg-zinc-300 cursor-not-allowed'}`}
              disabled={!shippingCalculated}
              title={shippingCalculated ? 'Finalizar compra' : 'Calcule o frete para continuar'}
              onClick={() => {
                if (!shippingCalculated) return;
                onClose();
                navigate("/checkout");
              }}
            >
              Finalizar compra
            </button>
          </>
        </div>
      </div>
    </>
  );
};

export default SidebarCart;
