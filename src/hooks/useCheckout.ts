import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from '@/contexts/CartContext';
import { orderService, CreateOrderData, Order } from '@/services/order';
import { paymentService, PaymentData, PaymentResponse } from '@/services/payment';
import { Address } from '@/services/address';
import { useToast } from './use-toast';

export type CheckoutStep = 'address' | 'payment' | 'confirmation' | 'processing' | 'success' | 'error';

export interface CheckoutState {
  currentStep: CheckoutStep;
  selectedAddress: Address | null;
  selectedPaymentMethod: string | null;
  order: Order | null;
  payment: PaymentResponse | null;
  isLoading: boolean;
  error: string | null;
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
  
  // Processamento
  createOrder: () => Promise<void>;
  processPayment: (paymentData?: Partial<PaymentData>) => Promise<PaymentResponse>;
  
  // Validações
  canProceedToPayment: boolean;
  canProceedToConfirmation: boolean;
  canProcessPayment: boolean;
  
  // Utilitários
  reset: () => void;
  calculateTotals: () => { subtotal: number; shipping: number; total: number };
}

export function useCheckout(): UseCheckoutReturn {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  const [state, setState] = useState<CheckoutState>({
    currentStep: 'address',
    selectedAddress: null,
    selectedPaymentMethod: null,
    order: null,
    payment: null,
    isLoading: false,
    error: null,
  });

  // Calcular totais do carrinho
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    // const shipping = state.selectedAddress ? 15.90 : 0; // Valor fixo por enquanto (temporariamente desativado)
    const shipping = 0;
    const total = subtotal + shipping;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }, [cart, state.selectedAddress]);

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

  // Criar pedido
  const createOrder = useCallback(async () => {
    if (!token || !user || !state.selectedAddress || !state.selectedPaymentMethod) {
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

      const orderData: CreateOrderData = {
        payment_method: state.selectedPaymentMethod,
        payment_status: 'pending',
        // shipping_cost: totals.shipping,
        shipping_cost: 0,
        discount: 0,
        subtotal: totals.subtotal,
        total: totals.total,
        items: orderItems,
        notes: undefined,
        shipping: shippingData
      };

      // Validar dados do pedido
      const validationErrors = orderService.validateOrderData(orderData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const order = await orderService.createOrder(orderData, token);

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
  }, [token, user, state.selectedAddress, state.selectedPaymentMethod, calculateTotals, cart, toast]);

  // Processar pagamento
  const processPayment = useCallback(async (additionalData?: Partial<PaymentData>) => {
    if (!token || !user || !state.order || !state.selectedPaymentMethod || !state.selectedAddress) {
      throw new Error('Dados insuficientes para processar pagamento');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, currentStep: 'processing' }));

    try {
      const totals = calculateTotals();

      const paymentData: PaymentData = {
        order_id: state.order.id,
        payment_method: state.selectedPaymentMethod as 'pix' | 'credit_card' | 'debit_card',
        total_amount: totals.total,
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
        payment = await paymentService.processDirectPayment(paymentData, token);
      } else {
        // Checkout Pro (redirecionamento)
        payment = await paymentService.createPaymentPreference(paymentData, token);
      }

      // Determinar próximo step baseado no status do pagamento
      let nextStep: CheckoutStep = 'processing';
      
      if (payment.status === 'approved') {
        nextStep = 'success';
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
  }, [token, user, state.order, state.selectedPaymentMethod, state.selectedAddress, calculateTotals, clearCart, toast]);

  // Reset do checkout
  const reset = useCallback(() => {
    setState({
      currentStep: 'address',
      selectedAddress: null,
      selectedPaymentMethod: null,
      order: null,
      payment: null,
      isLoading: false,
      error: null,
    });
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
  };
}

export default useCheckout;
