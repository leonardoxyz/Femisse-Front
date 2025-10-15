import api from '@/utils/api';
import { API_BASE_URL } from '@/config/api';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  variant_size?: string;
  variant_color?: string;
}

export interface CreateOrderData {
  payment_method: string;
  payment_status?: string;
  shipping_cost: number;
  discount?: number;
  subtotal?: number;
  total?: number;
  items: OrderItem[];
  notes?: string;
  shipping: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  // Dados do cupom de desconto
  coupon_id?: string;
  coupon_code?: string;
  coupon_discount?: number;
  // Dados do frete selecionado (MelhorEnvio)
  shipping_service_id?: number;
  shipping_service_name?: string;
  shipping_company_id?: number;
  shipping_company_name?: string;
  shipping_delivery_time?: number;
  shipping_quote_id?: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zip_code: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipping_address?: ShippingAddress | null;
  shipping_name?: string | null;
  shipping_street?: string | null;
  shipping_number?: string | null;
  shipping_complement?: string | null;
  shipping_neighborhood?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip_code?: string | null;
  // Dados do cupom de desconto
  coupon_id?: string | null;
  coupon_code?: string | null;
  coupon_discount?: number;
}

class OrderService {
  /**
   * Criar novo pedido
   * Token enviado automaticamente via cookies httpOnly
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post('/api/orders/my', orderData, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao criar pedido');
    }
  }

  /**
   * Buscar pedido por ID
   * Token enviado automaticamente via cookies httpOnly
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/${orderId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao buscar pedido');
    }
  }

  /**
   * Listar pedidos do usuário
   * Token enviado automaticamente via cookies httpOnly
   */
  async listUserOrders(page = 1, limit = 10): Promise<Order[]> {
    try {
      const response = await api.get('/api/orders/my', {
        params: { page, limit },
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error listing orders:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao listar pedidos');
    }
  }

  /**
   * Cancelar pedido
   * Token enviado automaticamente via cookies httpOnly
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await api.patch(`/api/orders/${orderId}/cancel`, null, {
        withCredentials: true
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao cancelar pedido');
    }
  }

  /**
   * Validar dados do pedido antes de criar
   */
  validateOrderData(orderData: Partial<CreateOrderData>): string[] {
    const errors: string[] = [];

    if (!orderData.items || orderData.items.length === 0) {
      errors.push('Pelo menos um item é obrigatório');
    }

    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`Item ${index + 1}: ID do produto é obrigatório`);
        }
        if (!item.product_name) {
          errors.push(`Item ${index + 1}: Nome do produto é obrigatório`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
        }
        if (!item.unit_price || item.unit_price <= 0) {
          errors.push(`Item ${index + 1}: Preço deve ser maior que zero`);
        }
      });
    }

    if (!orderData.payment_method) {
      errors.push('Método de pagamento é obrigatório');
    }

    if (!orderData.shipping) {
      errors.push('Dados de entrega são obrigatórios');
    }

    if (orderData.shipping_cost === undefined || orderData.shipping_cost < 0) {
      errors.push('Custo de frete deve ser informado');
    }

    return errors;
  }

  /**
   * Calcular totais do pedido
   */
  calculateOrderTotals(items: OrderItem[], shippingCost: number) {
    const subtotal = items.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);

    const total = subtotal + shippingCost;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping_cost: Number(shippingCost.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  /**
   * Formatar itens do carrinho para o pedido
   */
  formatCartItemsForOrder(cartItems: any[]): OrderItem[] {
    return cartItems.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_image: item.image || undefined,
      quantity: item.quantity,
      unit_price: item.price,
      variant_size: item.size || undefined,
      variant_color: item.color || undefined
    }));
  }

  /**
   * Obter status combinado e inteligente do pedido
   */
  getOrderStatusLabel(order: Order): string {
    // Se pagamento pendente, priorizar isso
    if (order.payment_status === 'pending') {
      return 'Aguardando pagamento';
    }
    
    // Se pagamento falhou
    if (order.payment_status === 'failed') {
      return 'Pagamento falhou';
    }
    
    // Se foi reembolsado
    if (order.payment_status === 'refunded') {
      return 'Reembolsado';
    }
    
    // Pagamento OK, mostrar status da entrega
    const statusMap: Record<Order['status'], string> = {
      'pending': 'Aguardando confirmação',
      'processing': 'Preparando pedido',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };

    return statusMap[order.status] || 'Status desconhecido';
  }

  /**
   * Obter cor do badge baseado no status combinado
   */
  getOrderStatusBadgeColor(order: Order): string {
    if (order.payment_status === 'pending') return 'yellow';
    if (order.payment_status === 'failed') return 'red';
    if (order.payment_status === 'refunded') return 'gray';
    if (order.status === 'cancelled') return 'red';
    if (order.status === 'delivered') return 'green';
    if (order.status === 'shipped') return 'purple';
    if (order.status === 'processing') return 'blue';
    return 'gray';
  }

  /**
   * Verificar se pedido pode ser cancelado
   */
  canCancelOrder(order: Order): boolean {
    return ['pending', 'processing'].includes(order.status) && 
           order.payment_status !== 'paid';
  }

  /**
   * Verificar se pedido pode ser pago
   */
  canPayOrder(order: Order): boolean {
    return order.status === 'pending' && 
           order.payment_status === 'pending';
  }

  /**
   * Formatar número do pedido para exibição
   */
  formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  }

  /**
   * Alias para listUserOrders (compatibilidade)
   */
  async getUserOrders(page = 1, limit = 10): Promise<Order[]> {
    return this.listUserOrders(page, limit);
  }
}

export const orderService = new OrderService();
export default orderService;
