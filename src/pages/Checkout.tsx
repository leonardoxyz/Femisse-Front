import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, CreditCard, Package, Check, Plus, Truck, Shield } from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import { useShipping } from "@/contexts/ShippingContext";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserAddresses, Address } from "@/services/address";

const FREE_SHIPPING_TARGET = 120;

type CheckoutStep = "address" | "payment" | "confirmation";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { shippingInfo, updateShippingInfo } = useShipping();
  const { user, token } = useAuth();
  
  // Estados do checkout
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const shippingCost = shippingInfo.shippingCost ?? 0;
  const total = subtotal + shippingCost;

  // Métodos de pagamento disponíveis
  const paymentMethods: PaymentMethod[] = [
    {
      id: "pix",
      name: "Pix",
      description: "Aprovação instantânea",
      icon: <Package className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      description: "Parcelamento em até 12x",
      icon: <CreditCard className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: "debit_card",
      name: "Cartão de Débito",
      description: "Débito à vista",
      icon: <CreditCard className="h-5 w-5" />,
      enabled: true,
    },
  ];

  const paymentHighlights: Record<string, string[]> = {
    pix: [
      "Confirmação automática em segundos.",
      "Disponível 24 horas por dia, inclusive fins de semana.",
      "Sem taxas adicionais.",
    ],
    credit_card: [
      "Parcele em até 12x sem juros.",
      "Aceitamos as principais bandeiras.",
      "Proteção contra compras não reconhecidas.",
    ],
    debit_card: [
      "Pagamento à vista direto na sua conta.",
      "Processamento seguro pelo Mercado Pago.",
      "Ideal para compras rápidas sem limite de crédito.",
    ],
  };

  const selectedPaymentDetails = useMemo(
    () => paymentMethods.find((method) => method.id === selectedPaymentMethod) ?? null,
    [paymentMethods, selectedPaymentMethod]
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatCep = (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return cep;
    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  // Carregar endereços do usuário
  const loadAddresses = useCallback(async () => {
    if (!token) return;
    
    setIsLoadingAddresses(true);
    try {
      const userAddresses = await fetchUserAddresses(token);
      setAddresses(userAddresses);
      
      // Selecionar endereço padrão automaticamente
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token]);

  // Navegação entre steps
  const goToNextStep = () => {
    if (currentStep === "address" && selectedAddressId) {
      setCurrentStep("payment");
    } else if (currentStep === "payment" && selectedPaymentMethod) {
      setCurrentStep("confirmation");
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("address");
    } else if (currentStep === "confirmation") {
      setCurrentStep("payment");
    } else {
      navigate(-1); // Volta para o carrinho
    }
  };

  // Carregar endereços ao montar o componente
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const orderSummary = (
    <div className="space-y-6 rounded-sm border border-[#58090d]/15 bg-white/90 p-5 shadow-[0_20px_45px_rgba(88,9,13,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">Resumo do pedido</h2>
        <span className="rounded-sm bg-[#58090d]/10 px-3 py-1 text-xs font-semibold text-[#58090d]">
          {cart.length} item{cart.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size ?? "default"}`} className="flex gap-4 p-3 rounded-sm bg-gray-50/50">
            <div className="relative">
              <img
                src={item.image || "/placeholder-product.jpg"}
                alt={item.name}
                className="h-20 w-20 flex-shrink-0 rounded-sm border object-cover"
                loading="lazy"
              />
              <span className="absolute -top-2 -right-2 bg-[#58090d] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <h4 className="font-medium text-zinc-900 line-clamp-2 mb-1">{item.name}</h4>
              <div className="space-y-1">
                {item.size && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Tamanho:</span>
                    <span className="text-xs font-medium bg-zinc-100 px-2 py-1 rounded uppercase">
                      {item.size}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {formatCurrency(item.price)} × {item.quantity}
                  </span>
                  <span className="font-semibold text-[#58090d]">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm text-zinc-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-zinc-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Frete</span>
          <span className="font-medium text-zinc-900">
            {shippingInfo.shippingCost === null
              ? "Calcular"
              : shippingCost === 0
                ? "Grátis"
                : formatCurrency(shippingCost)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 text-base font-semibold text-zinc-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={currentStep === "confirmation" ? undefined : goToNextStep}
        disabled={
          (currentStep === "address" && !selectedAddressId) ||
          (currentStep === "payment" && !selectedPaymentMethod) ||
          currentStep === "confirmation"
        }
        className="w-full rounded-sm bg-[#58090d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#58090d]/90 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {currentStep === "address" && "Continuar para pagamento"}
        {currentStep === "payment" && "Revisar pedido"}
        {currentStep === "confirmation" && "Finalizar compra"}
      </button>
      
      {currentStep === "confirmation" && (
        <p className="text-xs text-zinc-500 text-center">
          Ao finalizar, você concorda com os termos da Feminisse.
        </p>
      )}
    </div>
  );

  // Componente para o indicador de steps
  const StepIndicator = () => {
    const steps = [
      { id: "address", label: "Endereço", icon: <MapPin className="h-4 w-4" /> },
      { id: "payment", label: "Pagamento", icon: <CreditCard className="h-4 w-4" /> },
      { id: "confirmation", label: "Confirmação", icon: <Check className="h-4 w-4" /> },
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors ${
              index <= currentStepIndex 
                ? 'bg-[#58090d] text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step.icon}
              <span className="text-sm font-medium hidden sm:block">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-px w-8 mx-2 ${
                index < currentStepIndex ? 'bg-[#58090d]' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === "address" ? "Voltar ao carrinho" : "Voltar"}
              </button>
              <div className="h-6 w-px bg-zinc-300" />
              <span className="text-sm font-medium text-zinc-900">Checkout</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">
                {currentStep === "address" && "Etapa 1 de 3"}
                {currentStep === "payment" && "Etapa 2 de 3"}
                {currentStep === "confirmation" && "Etapa 3 de 3"}
              </span>
              <div className="flex gap-1">
                <div className="h-2 w-6 rounded-sm bg-primary" />
                <div className="h-2 w-6 rounded-sm bg-primary" />
                <div className="h-2 w-6 rounded-sm bg-zinc-200" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StepIndicator />

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Step: Address Selection */}
              {currentStep === "address" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-sm p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#58090d]/10">
                        <MapPin className="h-5 w-5 text-[#58090d]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Selecione o endereço de entrega</h2>
                        <p className="text-sm text-zinc-600">Escolha onde deseja receber seu pedido</p>
                      </div>
                    </div>

                    {isLoadingAddresses ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-sm" />
                        ))}
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedAddressId(address.id)}
                            className={`p-4 rounded-sm border-2 cursor-pointer transition-colors ${
                              selectedAddressId === address.id
                                ? 'border-[#58090d] bg-[#58090d]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-zinc-900">{address.label}</h3>
                                  {address.is_default && (
                                    <span className="bg-[#58090d] text-white text-xs px-2 py-1 rounded-full">
                                      Padrão
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-zinc-600">
                                  {address.street}, {address.number}
                                  {address.complement && `, ${address.complement}`}
                                </p>
                                <p className="text-sm text-zinc-600">
                                  {address.neighborhood}, {address.city} - {address.state}
                                </p>
                                <p className="text-sm text-zinc-500">
                                  CEP {formatCep(address.zip_code)}
                                </p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedAddressId === address.id
                                  ? 'border-[#58090d] bg-[#58090d]'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAddressId === address.id && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Link
                          to="/perfil/addresses"
                          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Adicionar novo endereço</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum endereço cadastrado
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Você precisa cadastrar um endereço para continuar com a compra.
                        </p>
                        <Link
                          to="/perfil/addresses"
                          className="inline-flex items-center gap-2 bg-[#58090d] text-white px-6 py-3 rounded-sm hover:bg-[#58090d]/90 transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                          Cadastrar endereço
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Payment Method */}
              {currentStep === "payment" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#58090d]/15 bg-white shadow-sm">
                    <div className="flex flex-col gap-6 p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#58090d]/10">
                          <CreditCard className="h-5 w-5 text-[#58090d]" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-zinc-900">Pagamento</h2>
                          <p className="text-sm text-zinc-600">
                            Escolha o método que melhor se encaixa no seu momento e visualize as condições antes de avançar.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="flex-1 space-y-6">
                          <div className="rounded-xl border border-dashed border-[#58090d]/30 bg-[#58090d]/5 p-5">
                            {selectedPaymentDetails ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#58090d] text-white">
                                    {selectedPaymentDetails.icon}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#58090d]/80">
                                      Método selecionado
                                    </p>
                                    <p className="text-lg font-semibold text-[#58090d]">
                                      {selectedPaymentDetails.name}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed text-[#58090d]/90">
                                  {selectedPaymentDetails.description}
                                </p>
                                <ul className="space-y-2 text-sm text-[#58090d]">
                                  {paymentHighlights[selectedPaymentDetails.id]?.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#58090d]" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 rounded-sm border border-[#58090d]/20 bg-white/80 px-4 py-3 text-sm text-[#58090d]">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Selecione um método de pagamento para visualizar os detalhes e benefícios.</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-semibold text-zinc-900">Formas de pagamento</p>
                              <p className="text-xs text-zinc-500">
                                Todos os pagamentos são processados com segurança pelo Mercado Pago.
                              </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {paymentMethods.map((method) => {
                                const isSelected = selectedPaymentMethod === method.id;
                                const isDisabled = !method.enabled;

                                return (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setSelectedPaymentMethod(method.id)}
                                    disabled={isDisabled}
                                    aria-pressed={isSelected}
                                    className={`group relative flex flex-col gap-4 rounded-xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#58090d] ${
                                      isDisabled
                                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                                        : isSelected
                                          ? 'border-[#58090d] bg-[#58090d]/5 shadow-[0_12px_28px_rgba(88,9,13,0.12)]'
                                          : 'border-gray-200 hover:border-[#58090d]/50 hover:bg-[#58090d]/5'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${
                                          isDisabled
                                            ? 'bg-gray-100 text-gray-400'
                                            : isSelected
                                              ? 'bg-[#58090d] text-white'
                                              : 'bg-[#58090d]/10 text-[#58090d]'
                                        }`}
                                      >
                                        {method.icon}
                                      </div>
                                      <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                          isSelected ? 'border-[#58090d] bg-[#58090d]' : 'border-gray-300'
                                        }`}
                                      >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p
                                        className={`text-base font-semibold ${
                                          isDisabled ? 'text-gray-400' : 'text-zinc-900'
                                        }`}
                                      >
                                        {method.name}
                                      </p>
                                      <p
                                        className={`text-sm leading-relaxed ${
                                          isDisabled ? 'text-gray-400' : 'text-zinc-600'
                                        }`}
                                      >
                                        {method.description}
                                      </p>
                                    </div>
                                    {!isDisabled && (
                                      <ul className="space-y-1 text-xs text-zinc-500">
                                        {paymentHighlights[method.id]?.slice(0, 2).map((item) => (
                                          <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-zinc-400" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Order Confirmation */}
              {currentStep === "confirmation" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-sm p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-green-100">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Confirme seu pedido</h2>
                        <p className="text-sm text-zinc-600">Revise os dados antes de finalizar</p>
                      </div>
                    </div>

                    {/* Selected Address Summary */}
                    {selectedAddressId && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-sm">
                        <h3 className="font-medium text-zinc-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Endereço de entrega
                        </h3>
                        {(() => {
                          const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                          return selectedAddress ? (
                            <div className="text-sm text-zinc-600">
                              <p>{selectedAddress.street}, {selectedAddress.number}</p>
                              {selectedAddress.complement && <p>{selectedAddress.complement}</p>}
                              <p>{selectedAddress.neighborhood}, {selectedAddress.city} - {selectedAddress.state}</p>
                              <p>CEP {formatCep(selectedAddress.zip_code)}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Selected Payment Method Summary */}
                    {selectedPaymentMethod && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-sm">
                        <h3 className="font-medium text-zinc-900 mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Forma de pagamento
                        </h3>
                        {(() => {
                          const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
                          return selectedMethod ? (
                            <div className="text-sm text-zinc-600">
                              <p>{selectedMethod.name} - {selectedMethod.description}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Shipping Info */}
                    <div className="p-4 rounded-sm">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-[#58090d]">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium text-zinc-900">Informações de entrega</h4>
                          <p className="text-sm text-zinc-600">
                            Prazo de entrega: 5 a 10 dias úteis
                          </p>
                          <p className="text-sm text-zinc-600">
                            Frete: {shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Mobile summary toggle */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="flex w-full items-center justify-between rounded-sm border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-900 transition hover:border-zinc-300"
                  >
                    <span>Resumo do pedido</span>
                    <ChevronLeft className={`h-4 w-4 transition-transform ${isSummaryOpen ? 'rotate-90' : '-rotate-90'}`} />
                  </button>
                  {isSummaryOpen && <div className="mt-4">{orderSummary}</div>}
                </div>

                {/* Desktop summary */}
                <div className="hidden lg:block">{orderSummary}</div>

                {/* Security info */}
                <div className="rounded-sm bg-green-50 p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Compra 100% segura</p>
                      <p className="text-xs text-green-700 mt-1">
                        Seus dados estão protegidos com criptografia SSL de 256 bits.
                        Processamento via Mercado Pago.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;