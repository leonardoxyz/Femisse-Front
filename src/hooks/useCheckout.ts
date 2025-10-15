import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from '@/contexts/CartContext';
import { orderService, CreateOrderData, Order } from '@/services/order';
import { paymentService, PaymentData, PaymentResponse } from '@/services/payment';
import { Address } from '@/services/address';
import { useToast } from './use-toast';
import { couponService, ValidateCouponResponse } from '@/services/coupon';

export type CheckoutStep = 'address' | 'payment' | 'confirmation' | 'processing' | 'success' | 'error';

export interface SelectedShipping {
  service_id: number;
  service_name: string;
  company_id: number;
  company_name: string;
  delivery_time: number;
  price: number;
  quote_id?: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  selectedAddress: Address | null;
  selectedPaymentMethod: string | null;
  selectedShipping: SelectedShipping | null;
  order: Order | null;
  payment: PaymentResponse | null;
  isLoading: boolean;
  error: string | null;
  showSuccessModal: boolean;
  appliedCoupon: ValidateCouponResponse | null;
  isCouponLoading: boolean;
}

export interface UseCheckoutReturn {
  // Estado
  state: CheckoutState;
  
  // Navegação
  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Seleções
  selectAddress: (address: Address) => void;
  selectPaymentMethod: (method: string) => void;
  selectShipping: (shipping: SelectedShipping) => void;
  
  // Cupons
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  
  // Processamento
  createOrder: () => Promise<void>;
  processPayment: (paymentData?: Partial<PaymentData>) => Promise<PaymentResponse>;
  
  // Validações
  canProceedToPayment: boolean;
  canProceedToConfirmation: boolean;
  canProcessPayment: boolean;
  
  // Utilitários
  reset: () => void;
  calculateTotals: () => { subtotal: number; shipping: number; discount: number; total: number };
  
  // Modal
  closeSuccessModal: () => void;
  showSuccessModal: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  const [state, setState] = useState<CheckoutState>({
    currentStep: 'address',
    selectedAddress: null,
    selectedPaymentMethod: null,
    selectedShipping: null,
    order: null,
    payment: null,
    isLoading: false,
    error: null,
    showSuccessModal: false,
    appliedCoupon: null,
    isCouponLoading: false,
  });

  // Calcular totais do carrinho
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = state.selectedShipping?.price || 0;
    const discount = state.appliedCoupon?.valid ? (state.appliedCoupon.discount_amount || 0) : 0;
    const total = subtotal + shipping - discount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }, [cart, state.selectedShipping, state.appliedCoupon]);

  // Validações para navegação
  const canProceedToPayment = useMemo(() => {
    return state.selectedAddress !== null && cart.length > 0;
  }, [state.selectedAddress, cart.length]);

  const canProceedToConfirmation = useMemo(() => {
    return canProceedToPayment && state.selectedPaymentMethod !== null;
  }, [canProceedToPayment, state.selectedPaymentMethod]);

  const canProcessPayment = useMemo(() => {
    return canProceedToConfirmation && state.order !== null;
  }, [canProceedToConfirmation, state.order]);

  // Navegação entre steps
  const goToStep = useCallback((step: CheckoutStep) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState(prev => {
      let nextStep: CheckoutStep = prev.currentStep;

      switch (prev.currentStep) {
        case 'address':
          if (canProceedToPayment) nextStep = 'payment';
          break;
        case 'payment':
          if (canProceedToConfirmation) nextStep = 'confirmation';
          break;
        case 'confirmation':
          nextStep = 'processing';
          break;
        default:
          break;
      }

      return { ...prev, currentStep: nextStep, error: null };
    });
  }, [canProceedToPayment, canProceedToConfirmation]);

  const goToPreviousStep = useCallback(() => {
    setState(prev => {
      let prevStep: CheckoutStep = prev.currentStep;

      switch (prev.currentStep) {
        case 'payment':
          prevStep = 'address';
          break;
        case 'confirmation':
          prevStep = 'payment';
          break;
        case 'processing':
          prevStep = 'confirmation';
          break;
        case 'error':
          prevStep = 'confirmation';
          break;
        default:
          // Se estiver no primeiro step, volta para o carrinho
          navigate('/');
          return prev;
      }

      return { ...prev, currentStep: prevStep, error: null };
    });
  }, [navigate]);

  // Seleções
  const selectAddress = useCallback((address: Address) => {
    setState(prev => ({ ...prev, selectedAddress: address, error: null }));
  }, []);

  const selectPaymentMethod = useCallback((method: string) => {
    setState(prev => ({ ...prev, selectedPaymentMethod: method, error: null }));
  }, []);

  const selectShipping = useCallback((shipping: SelectedShipping) => {
    setState(prev => ({ ...prev, selectedShipping: shipping, error: null }));
  }, []);

  // Aplicar cupom
  const applyCoupon = useCallback(async (code: string) => {
    if (!cart || cart.length === 0) {
      throw new Error('Carrinho vazio');
    }

    setState(prev => ({ ...prev, isCouponLoading: true, error: null }));

    try {
      const totals = calculateTotals();
      
      // Preparar itens do carrinho para validação
      const cartItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await couponService.validateCoupon({
        code,
        cart_items: cartItems,
        subtotal: totals.subtotal
      });

      if (response.valid) {
        setState(prev => ({
          ...prev,
          appliedCoupon: response,
          isCouponLoading: false,
          error: null
        }));

        toast({
          title: "Cupom aplicado!",
          description: response.message,
        });
      } else {
        setState(prev => ({
          ...prev,
          appliedCoupon: null,
          isCouponLoading: false,
          error: response.message || response.error
        }));

        toast({
          title: "Cupom inválido",
          description: response.message || response.error || 'Cupom não pode ser aplicado',
          variant: "destructive",
        });

        throw new Error(response.message || response.error || 'Cupom inválido');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        appliedCoupon: null,
        isCouponLoading: false
      }));

      throw error;
    }
  }, [cart, calculateTotals, toast]);

  // Remover cupom
  const removeCoupon = useCallback(() => {
    setState(prev => ({
      ...prev,
      appliedCoupon: null,
      error: null
    }));

    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do pedido",
    });
  }, [toast]);

  // Criar pedido
  const createOrder = useCallback(async () => {
    if (!isAuthenticated || !user || !state.selectedAddress || !state.selectedPaymentMethod) {
      throw new Error('Dados insuficientes para criar pedido');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const totals = calculateTotals();
      const orderItems = orderService.formatCartItemsForOrder(cart);

      // Formatar dados do endereço para o formato esperado pelo backend
      const shippingData = {
        name: state.selectedAddress.label || `${user.nome || 'Cliente'}`,
        street: state.selectedAddress.street,
        number: state.selectedAddress.number,
        complement: state.selectedAddress.complement || undefined,
        neighborhood: state.selectedAddress.neighborhood,
        city: state.selectedAddress.city,
        state: state.selectedAddress.state,
        zip_code: state.selectedAddress.zip_code
      };

      const hasCoupon = !!state.appliedCoupon?.valid;
      const rawCouponDiscount = hasCoupon ? state.appliedCoupon?.discount_amount ?? 0 : 0;
      const couponDiscountValue = Number(rawCouponDiscount.toFixed(2));
      const discountValue = hasCoupon ? 0 : Number(totals.discount.toFixed(2));
      const subtotalValue = Number(totals.subtotal.toFixed(2));
      const totalValue = Number(totals.total.toFixed(2));

      const orderData: CreateOrderData = {
        payment_method: state.selectedPaymentMethod,
        payment_status: 'pending',
        shipping_cost: totals.shipping,
        discount: discountValue,
        subtotal: subtotalValue,
        total: totalValue,
        items: orderItems,
        notes: undefined,
        shipping: shippingData,
        // Dados do cupom se aplicado
        coupon_id: state.appliedCoupon?.coupon?.id,
        coupon_code: state.appliedCoupon?.coupon?.code,
        coupon_discount: hasCoupon ? couponDiscountValue : 0,
        // Dados do frete selecionado
        shipping_service_id: state.selectedShipping?.service_id,
        shipping_service_name: state.selectedShipping?.service_name,
        shipping_company_id: state.selectedShipping?.company_id,
        shipping_company_name: state.selectedShipping?.company_name,
        shipping_delivery_time: state.selectedShipping?.delivery_time,
        shipping_quote_id: state.selectedShipping?.quote_id
      };

      // Validar dados do pedido
      const validationErrors = orderService.validateOrderData(orderData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const order = await orderService.createOrder(orderData);

      setState(prev => ({
        ...prev,
        order,
        isLoading: false,
        error: null
      }));

      toast({
        title: "Pedido criado com sucesso!",
        description: `Pedido ${orderService.formatOrderNumber(order.order_number)} criado.`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar pedido';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        title: "Erro ao criar pedido",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [
    isAuthenticated,
    user,
    state.selectedAddress,
    state.selectedPaymentMethod,
    state.appliedCoupon,
    calculateTotals,
    cart,
    toast
  ]);

  // Processar pagamento
  const processPayment = useCallback(async (additionalData?: Partial<PaymentData>) => {
    if (!isAuthenticated || !user || !state.order || !state.selectedPaymentMethod || !state.selectedAddress) {
      throw new Error('Dados insuficientes para processar pagamento');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, currentStep: 'processing' }));

    try {
      // IMPORTANTE: Usar o total do pedido já criado, não recalcular
      // O pedido já foi validado e salvo no banco com o total correto
      const orderTotal = state.order.total;

      const paymentData: PaymentData = {
        order_id: state.order.id,
        payment_method: state.selectedPaymentMethod as 'pix' | 'credit_card' | 'debit_card',
        total_amount: orderTotal,
        payer: paymentService.formatPayerData(user),
        shipping_address: paymentService.formatShippingAddress(state.selectedAddress),
        metadata: {
          user_id: user.id,
          order_number: state.order.order_number,
          platform: 'feminisse-ecommerce'
        },
        ...additionalData
      };

      // Validar dados de pagamento
      const validationErrors = paymentService.validatePaymentData(paymentData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      let payment: PaymentResponse;

      // Escolher método de processamento baseado no tipo de pagamento
      if (paymentData.payment_method === 'pix' || paymentData.card_token) {
        // Pagamento direto (PIX ou cartão com token)
        payment = await paymentService.processDirectPayment(paymentData);
      } else {
        // Checkout Pro (redirecionamento - fallback se não tiver token)
        payment = await paymentService.createPaymentPreference(paymentData);
      }

      // Determinar próximo step baseado no status do pagamento
      let nextStep: CheckoutStep = 'processing';
      let showModal = false;
      
      if (payment.status === 'approved') {
        // Para pagamentos aprovados, mostrar modal em vez de mudar step
        showModal = true;
        clearCart(); // Só limpar carrinho se aprovado
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pagamento foi aprovado com sucesso.",
        });
      } else if (payment.status === 'rejected') {
        nextStep = 'error';
        toast({
          title: "Pagamento rejeitado",
          description: "Seu pagamento foi rejeitado. Tente novamente.",
          variant: "destructive",
        });
      } else {
        // pending, in_process, etc
        toast({
          title: "Pagamento em processamento",
          description: "Aguarde a confirmação do pagamento.",
        });
      }

      setState(prev => ({
        ...prev,
        payment,
        isLoading: false,
        currentStep: nextStep,
        showSuccessModal: showModal,
        error: null
      }));

      return payment;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentStep: 'error',
        error: errorMessage
      }));

      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [isAuthenticated, user, state.order, state.selectedPaymentMethod, state.selectedAddress, calculateTotals, clearCart, toast]);

  // Reset do checkout
  const reset = useCallback(() => {
    setState({
      currentStep: 'address',
      selectedAddress: null,
      selectedPaymentMethod: null,
      selectedShipping: null,
      order: null,
      payment: null,
      isLoading: false,
      error: null,
      showSuccessModal: false,
      appliedCoupon: null,
      isCouponLoading: false,
    });
  }, []);

  // Fechar modal de sucesso
  const closeSuccessModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSuccessModal: false
    }));
  }, []);

  // Mostrar modal de sucesso
  const showSuccessModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSuccessModal: true
    }));
  }, []);

  return {
    // Estado
    state,
    
    // Navegação
    goToStep,
    goToNextStep,
    goToPreviousStep,
    
    // Seleções
    selectAddress,
    selectPaymentMethod,
    selectShipping,
    
    // Cupons
    applyCoupon,
    removeCoupon,
    
    // Processamento
    createOrder,
    processPayment,
    
    // Validações
    canProceedToPayment,
    canProceedToConfirmation,
    canProcessPayment,
    
    // Utilitários
    reset,
    calculateTotals,
    
    // Modal
    closeSuccessModal,
    showSuccessModal,
  };
}

export default useCheckout;
