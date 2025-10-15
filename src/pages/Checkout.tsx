import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, MapPin, CreditCard, Package, Check, Plus, Truck, Shield, AlertCircle } from "lucide-react";
import { useSecureCPFVerification } from "@/hooks/useSecureCPFVerification";
import { checkoutStateManager } from "@/utils/checkoutStateManager";

import { useCart } from "@/contexts/CartContext";
import { useShipping } from "@/contexts/ShippingContext";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserAddresses, Address } from "@/services/address";
import { useCheckout } from "@/hooks/useCheckout";
import PaymentForm from "@/components/checkout/PaymentForm";
import PaymentStatus from "@/components/checkout/PaymentStatus";
import SuccessModal from "@/components/checkout/SuccessModal";
import CouponInput from "@/components/checkout/CouponInput";
import ShippingCalculator from "@/components/checkout/ShippingCalculator";
import { formatCurrency, formatCep } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const { shippingInfo, updateShippingInfo } = useShipping();
  const { user, isAuthenticated } = useAuth();
  
  // Hook seguro para verificação de CPF
  const { cpf: userCPF, isChecking: isCheckingCPF, revalidate: revalidateCPF } = useSecureCPFVerification(
    user?.id,
    isAuthenticated
  );
  
  // Verificar se há um pedido pendente vindo do histórico
  const pendingOrder = location.state?.pendingOrder;
  
  // Hook personalizado para checkout
  const {
    state: checkoutState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    selectAddress,
    selectPaymentMethod,
    selectShipping,
    applyCoupon,
    removeCoupon,
    createOrder,
    processPayment,
    canProceedToPayment,
    canProceedToConfirmation,
    canProcessPayment,
    calculateTotals,
    closeSuccessModal,
    showSuccessModal
  } = useCheckout();
  
  // Estados locais
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [hasCalledApproved, setHasCalledApproved] = useState(false);
  const [selectedShippingQuote, setSelectedShippingQuote] = useState<any>(null);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState<number>(0);

  const totals = useMemo(() => {
    // Se houver pedido pendente, usar os valores dele
    if (pendingOrder) {
      return {
        subtotal: pendingOrder.subtotal,
        shipping: pendingOrder.shipping_cost,
        discount: pendingOrder.coupon_discount || 0,
        total: pendingOrder.total
      };
    }
    return calculateTotals();
  }, [calculateTotals, pendingOrder]);
  
  const { subtotal, shipping: shippingCost, discount, total } = totals;
  
  // Restaurar step e dados do location.state se houver (vindo do perfil após preencher CPF)
  useEffect(() => {
    if (location.state?.returnStep) {
      goToStep(location.state.returnStep);
      
      // Restaurar cupom aplicado se houver
      const checkoutData = location.state?.checkoutData;
      if (checkoutData?.appliedCouponCode && !checkoutState.appliedCoupon) {
        applyCoupon(checkoutData.appliedCouponCode);
      }
      
      // Restaurar endereço selecionado se houver e ainda não foi selecionado
      if (checkoutData?.selectedAddressId && !checkoutState.selectedAddress && addresses.length > 0) {
        const savedAddress = addresses.find(addr => addr.id === checkoutData.selectedAddressId);
        if (savedAddress) {
          selectAddress(savedAddress);
        }
      }
      
      // Limpar o state para não ficar reaplicando
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, goToStep, location.pathname, applyCoupon, checkoutState.appliedCoupon, checkoutState.selectedAddress, addresses, selectAddress]);

  // Redirecionar para pagamento se houver pedido pendente
  useEffect(() => {
    if (pendingOrder && checkoutState.currentStep === 'address') {
      goToStep('payment');
    }
  }, [pendingOrder, checkoutState.currentStep, goToStep]);

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
    () => paymentMethods.find((method) => method.id === checkoutState.selectedPaymentMethod) ?? null,
    [paymentMethods, checkoutState.selectedPaymentMethod]
  );

  // Função para carregar endereços do usuário
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingAddresses(true);
    try {
      const userAddresses = await fetchUserAddresses();
      setAddresses(userAddresses);
      
      // Selecionar endereço padrão automaticamente
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        selectAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [isAuthenticated, selectAddress]);

  // Handlers para processar checkout
  const handleCreateOrder = async () => {
    try {
      await createOrder();
      goToNextStep();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  // Handler para quando uma cotação de frete for selecionada
  const handleSelectShippingQuote = (quote: any, cost: number) => {
    setSelectedShippingQuote(quote);
    setCalculatedShippingCost(cost);
    
    // Atualizar contexto de shipping
    updateShippingInfo({
      cep: checkoutState.selectedAddress?.zip_code || '',
      address: null,
      shippingCost: cost,
      source: 'manual'
    });

    // Atualizar dados de frete no checkout
    selectShipping({
      service_id: quote.id,
      service_name: quote.name,
      company_id: quote.company.id,
      company_name: quote.company.name,
      delivery_time: quote.custom_delivery_time || quote.delivery_time,
      price: cost,
      quote_id: quote.quote_id // Se houver ID da cotação salva no banco
    });
  };

  // Handler para quando os dados de pagamento mudarem
  const handlePaymentDataChange = (data: any, isValid: boolean) => {
    setPaymentData(data);
    setIsPaymentValid(isValid);
    
    // Atualizar o método de pagamento selecionado no estado do checkout
    if (data.payment_method) {
      selectPaymentMethod(data.payment_method);
    }
  };

  // Handler para processar pagamento (chamado ao clicar em "Revisar pedido")
  const handleReviewOrder = async () => {
    if (!isPaymentValid || !paymentData) {
      return;
    }

    try {
      // Criar pedido
      await createOrder();
      
      // Avançar para confirmação
      goToNextStep();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  // Handler para finalizar pedido (na tela de confirmação)
  const handleFinalizeOrder = async () => {
    try {
      // Processar o pagamento (o hook já muda o step para 'processing')
      await processPayment(paymentData);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      // O hook já trata o erro e muda para 'error'
    }
  };

  // Handler para quando o pagamento for aprovado via polling
  const handlePaymentApproved = useCallback(() => {
    // Prevenir múltiplas chamadas
    if (hasCalledApproved) {
      return;
    }

    setHasCalledApproved(true);
    clearCart();
    goToStep('success');
    // Mostrar modal de sucesso
    showSuccessModal();
  }, [showSuccessModal, hasCalledApproved, goToStep, clearCart]);

  // Verificar CPF e redirecionar se necessário
  useEffect(() => {
    // Só verifica se estiver autenticado e não estiver no step de endereço
    if (!isAuthenticated || !user || checkoutState.currentStep === 'address' || isCheckingCPF) {
      return;
    }

    // Se não tiver CPF e não estiver verificando, redirecionar
    if (!userCPF) {
      navigate('/perfil', { 
        state: { 
          message: 'Por favor, preencha seu CPF para continuar com a compra. O CPF é obrigatório para emissão de nota fiscal.',
          returnTo: '/checkout',
          returnStep: checkoutState.currentStep,
          highlightCPF: true,
          // Preservar dados do checkout
          checkoutData: {
            selectedAddressId: checkoutState.selectedAddress?.id,
            appliedCouponCode: checkoutState.appliedCoupon?.coupon?.code
          }
        } 
      });
    }
  }, [isAuthenticated, user, userCPF, isCheckingCPF, navigate, checkoutState.currentStep, checkoutState.selectedAddress, checkoutState.appliedCoupon]);

  // Carregar endereços ao montar o componente
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Garantir que não ficamos presos no step processing quando já aprovado
  useEffect(() => {
    if (checkoutState.currentStep === 'processing' && hasCalledApproved) {
      goToStep('success');
    }
  }, [checkoutState.currentStep, hasCalledApproved, goToStep]);

  // Resetar flag quando sair da tela de processamento/sucesso
  useEffect(() => {
    if (checkoutState.currentStep !== 'processing' && checkoutState.currentStep !== 'success') {
      setHasCalledApproved(false);
    }
  }, [checkoutState.currentStep]);

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

      {/* Cupom de desconto - apenas nos steps de endereço e pagamento */}
      {(checkoutState.currentStep === 'address' || checkoutState.currentStep === 'payment') && (
        <div className="pb-4 border-b border-zinc-200">
          <CouponInput
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
            appliedCoupon={checkoutState.appliedCoupon}
            isLoading={checkoutState.isCouponLoading}
            disabled={checkoutState.isLoading}
          />
        </div>
      )}

      <div className="space-y-2 text-sm text-zinc-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-zinc-900">{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>Desconto (Cupom)</span>
            <span className="font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
        
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

      <Button
        type="button"
        onClick={() => {
          if (checkoutState.currentStep === 'address' && canProceedToPayment) {
            // Verificar se tem CPF antes de avançar para pagamento
            if (!userCPF) {
              navigate('/perfil', { 
                state: { 
                  message: 'Por favor, preencha seu CPF para continuar com a compra. O CPF é obrigatório para emissão de nota fiscal.',
                  returnTo: '/checkout',
                  returnStep: 'payment',
                  highlightCPF: true,
                  // Preservar dados do checkout
                  checkoutData: {
                    selectedAddressId: checkoutState.selectedAddress?.id,
                    appliedCouponCode: checkoutState.appliedCoupon?.coupon?.code
                  }
                } 
              });
              return;
            }
            goToNextStep();
          } else if (checkoutState.currentStep === 'payment' && isPaymentValid) {
            handleReviewOrder();
          } else if (checkoutState.currentStep === 'confirmation') {
            handleFinalizeOrder();
          }
        }}
        disabled={
          (checkoutState.currentStep === "address" && !canProceedToPayment) ||
          (checkoutState.currentStep === "payment" && !isPaymentValid) ||
          checkoutState.isLoading ||
          isCheckingCPF
        }
        className="w-full"
      >
        {checkoutState.currentStep === "address" && (isCheckingCPF ? "Verificando..." : "Continuar para pagamento")}
        {checkoutState.currentStep === "payment" && "Revisar pedido"}
        {checkoutState.currentStep === "confirmation" && "Finalizar pedido"}
      </Button>
      
      {checkoutState.currentStep === "confirmation" && (
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

    const currentStepIndex = steps.findIndex(step => step.id === checkoutState.currentStep);

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
                {checkoutState.currentStep === "address" ? "Voltar ao carrinho" : "Voltar"}
              </button>
              <div className="h-6 w-px bg-zinc-300" />
              <span className="text-sm font-medium text-zinc-900">Checkout</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">
                {checkoutState.currentStep === "address" && "Etapa 1 de 3"}
                {checkoutState.currentStep === "payment" && "Etapa 2 de 3"}
                {checkoutState.currentStep === "confirmation" && "Etapa 3 de 3"}
                {checkoutState.currentStep === "processing" && "Processando"}
                {checkoutState.currentStep === "success" && "Concluído"}
                {checkoutState.currentStep === "error" && "Erro"}
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

          <div className={`grid gap-8 ${(checkoutState.currentStep === 'processing' || checkoutState.currentStep === 'success') ? 'lg:grid-cols-1' : 'lg:grid-cols-12'}`}>
            {/* Main Content */}
            <div className={`${(checkoutState.currentStep === 'processing' || checkoutState.currentStep === 'success') ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-8'}`}>
              {/* Step: Address Selection */}
              {checkoutState.currentStep === "address" && (
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
                            onClick={() => selectAddress(address)}
                            className={`p-4 rounded-sm border-2 cursor-pointer transition-colors ${
                              checkoutState.selectedAddress?.id === address.id
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
                                checkoutState.selectedAddress?.id === address.id
                                  ? 'border-[#58090d] bg-[#58090d]'
                                  : 'border-gray-300'
                              }`}>
                                {checkoutState.selectedAddress?.id === address.id && (
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

                  {/* Calculadora de Frete - MelhorEnvio */}
                  {checkoutState.selectedAddress && (
                    <div className="bg-white rounded-sm p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#58090d]/10">
                          <Truck className="h-5 w-5 text-[#58090d]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-900">Calcular Frete</h2>
                          <p className="text-sm text-zinc-600">Escolha a melhor opção de entrega</p>
                        </div>
                      </div>

                      <ShippingCalculator
                        products={cart}
                        selectedAddress={checkoutState.selectedAddress}
                        onSelectQuote={handleSelectShippingQuote}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step: Payment Method */}
              {checkoutState.currentStep === "payment" && (
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

                      <PaymentForm
                        onPaymentDataChange={handlePaymentDataChange}
                        totalAmount={total}
                        initialCPF={userCPF || undefined}
                      />

                      <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="flex-1 space-y-6">
                      {checkoutState.error && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {checkoutState.error}
                          </AlertDescription>
                        </Alert>
                      )}
                        </div>

                        
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Order Confirmation */}
              {checkoutState.currentStep === "confirmation" && (
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
                    {checkoutState.selectedAddress && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-sm">
                        <h3 className="font-medium text-zinc-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Endereço de entrega
                        </h3>
                        <div className="text-sm text-zinc-600">
                          <p>{checkoutState.selectedAddress.street}, {checkoutState.selectedAddress.number}</p>
                          {checkoutState.selectedAddress.complement && <p>{checkoutState.selectedAddress.complement}</p>}
                          <p>{checkoutState.selectedAddress.neighborhood}, {checkoutState.selectedAddress.city} - {checkoutState.selectedAddress.state}</p>
                          <p>CEP {formatCep(checkoutState.selectedAddress.zip_code)}</p>
                        </div>
                      </div>
                    )}

                    {/* Selected Payment Method Summary */}
                    {checkoutState.selectedPaymentMethod && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-sm">
                        <h3 className="font-medium text-zinc-900 mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Forma de pagamento
                        </h3>
                        <div className="text-sm text-zinc-600">
                          <p>{checkoutState.selectedPaymentMethod} - Método selecionado</p>
                        </div>
                      </div>
                    )}

                    {!checkoutState.order && (
                      <Button
                        onClick={handleCreateOrder}
                        disabled={checkoutState.isLoading || !canProcessPayment}
                        className="w-full mb-4"
                      >
                        {checkoutState.isLoading ? 'Criando pedido...' : 'Criar pedido'}
                      </Button>
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

              {/* Step: Processing Payment */}
              {(checkoutState.currentStep === 'processing' || checkoutState.currentStep === 'error') && checkoutState.payment && !checkoutState.showSuccessModal && (
                <div className="space-y-6">
                  <PaymentStatus
                    payment={checkoutState.payment}
                    onStatusChange={(status) => {
                      if (status === 'rejected') {
                        goToStep('error');
                      }
                    }}
                    onPaymentApproved={handlePaymentApproved}
                  />
                </div>
              )}

              {/* Error State */}
              {checkoutState.currentStep === 'error' && (
                <div className="space-y-6">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {checkoutState.error || 'Ocorreu um erro durante o checkout.'}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => goToStep('payment')}
                      className="flex-1"
                    >
                      Tentar novamente
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Voltar ao carrinho
                    </Button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {checkoutState.currentStep === 'success' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
                      Pedido realizado com sucesso!
                    </h2>
                    <p className="text-zinc-600">
                      Você receberá um e-mail com os detalhes do seu pedido.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => navigate('/perfil/orders')}
                      className="flex-1"
                    >
                      Ver meus pedidos
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Continuar comprando
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Esconder quando estiver processando ou aprovado */}
            {checkoutState.currentStep !== 'processing' && checkoutState.currentStep !== 'success' && (
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
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={checkoutState.showSuccessModal}
        onClose={() => {
          closeSuccessModal();
          // Resetar flag ao fechar para permitir novo fluxo
          setHasCalledApproved(false);
        }}
        orderNumber={checkoutState.order?.order_number}
        total={totals.total}
        paymentMethod={checkoutState.selectedPaymentMethod || undefined}
      />
    </div>
  );
};

export default CheckoutPage;