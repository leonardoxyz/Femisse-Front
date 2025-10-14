import api from '@/utils/api';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  scope: 'product' | 'category' | 'storewide';
  applicable_products?: string[];
  applicable_categories?: string[];
  min_purchase_amount?: number;
  valid_from: string;
  valid_to?: string;
  active: boolean;
}

export interface CartItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface ValidateCouponRequest {
  code: string;
  cart_items: CartItem[];
  subtotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    scope: 'product' | 'category' | 'storewide';
  };
  discount_amount?: number;
  applicable_items?: string[];
  message: string;
  error?: string;
}

export interface CouponUsageHistory {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_applied: number;
  used_at: string;
  coupons?: {
    code: string;
    description: string;
  };
  orders?: {
    order_number: string;
    total: number;
    created_at: string;
  };
}

class CouponService {
  /**
   * Validar cupom de desconto
   * Token enviado automaticamente via cookies httpOnly
   */
  async validateCoupon(
    request: ValidateCouponRequest
  ): Promise<ValidateCouponResponse> {
    try {
      const response = await api.post('/api/coupons/validate', request);
      return response.data;
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      
      // Retornar mensagem de erro do backend
      if (error.response?.data) {
        return {
          valid: false,
          message: error.response.data.message || error.response.data.error || 'Cupom inválido',
          error: error.response.data.error
        };
      }
      
      throw new Error('Erro ao validar cupom');
    }
  }

  /**
   * Listar cupons ativos (não requer autenticação)
   */
  async listActiveCoupons(): Promise<Coupon[]> {
    try {
      const response = await api.get('/api/coupons/active');
      return response.data.coupons || [];
    } catch (error: any) {
      console.error('Error listing active coupons:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar cupons');
    }
  }

  /**
   * Obter histórico de cupons do usuário
   * Token enviado automaticamente via cookies httpOnly
   */
  async getUserCouponHistory(): Promise<CouponUsageHistory[]> {
    try {
      const response = await api.get('/api/coupons/my-history');
      return response.data.history || [];
    } catch (error: any) {
      console.error('Error getting user coupon history:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar histórico de cupons');
    }
  }

  /**
   * Criar cupom (apenas admin)
   * Token enviado automaticamente via cookies httpOnly
   */
  async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
    try {
      const response = await api.post('/api/coupons', couponData);
      return response.data.coupon;
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar cupom');
    }
  }

  /**
   * Atualizar cupom (apenas admin)
   * Token enviado automaticamente via cookies httpOnly
   */
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    try {
      const response = await api.put(`/api/coupons/${id}`, updates);
      return response.data.coupon;
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar cupom');
    }
  }

  /**
   * Deletar cupom (apenas admin)
   * Token enviado automaticamente via cookies httpOnly
   */
  async deleteCoupon(id: string): Promise<void> {
    try {
      await api.delete(`/api/coupons/${id}`);
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar cupom');
    }
  }

  /**
   * Formatar desconto para exibição
   */
  formatDiscount(coupon: Coupon): string {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `R$ ${coupon.discount_value.toFixed(2)} OFF`;
    }
  }

  /**
   * Verificar se cupom está válido (data)
   */
  isCouponValid(coupon: Coupon): boolean {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = coupon.valid_to ? new Date(coupon.valid_to) : null;

    if (now < validFrom) return false;
    if (validTo && now > validTo) return false;

    return coupon.active;
  }

  /**
   * Calcular desconto estimado (sem validação no backend)
   */
  estimateDiscount(
    coupon: Coupon,
    subtotal: number
  ): number {
    if (coupon.discount_type === 'percentage') {
      return (subtotal * coupon.discount_value) / 100;
    } else {
      return Math.min(coupon.discount_value, subtotal);
    }
  }
}

// Exportar instância única do serviço
export const couponService = new CouponService();

export default couponService;
