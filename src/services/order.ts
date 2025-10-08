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
  shipping_address?: any;
}

export interface OrderHistory {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

class OrderService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Criar novo pedido
   */
  async createOrder(orderData: CreateOrderData, token: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao criar pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Buscar pedido por ID
   */
  async getOrder(orderId: string, token: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao buscar pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de pedidos do usuário
   */
  async getUserOrders(
    token: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrderHistory> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/orders/user/orders?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao buscar pedidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  /**
   * Cancelar pedido
   */
  async cancelOrder(orderId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao cancelar pedido');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
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
   * Obter status legível do pedido
   */
  getOrderStatusLabel(status: Order['status']): string {
    const statusMap: Record<Order['status'], string> = {
      'pending': 'Aguardando pagamento',
      'processing': 'Processando',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };

    return statusMap[status] || 'Status desconhecido';
  }

  /**
   * Obter status legível do pagamento
   */
  getPaymentStatusLabel(status: Order['payment_status']): string {
    const statusMap: Record<Order['payment_status'], string> = {
      'pending': 'Aguardando pagamento',
      'paid': 'Pago',
      'failed': 'Falha no pagamento',
      'refunded': 'Estornado'
    };

    return statusMap[status] || 'Status desconhecido';
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
}

export const orderService = new OrderService();
export default orderService;
