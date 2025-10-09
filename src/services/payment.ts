import api from '@/utils/api';
import { API_BASE_URL } from '@/config/api';

export interface PaymentData {
  order_id: string;
  payment_method: 'pix' | 'credit_card' | 'debit_card';
  card_token?: string;
  installments?: number;
  total_amount: number;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification?: {
      type: 'CPF';
      number: string;
    };
  };
  shipping_address?: {
    street_name: string;
    street_number: string;
    zip_code: string;
    city: string;
    state: string;
    neighborhood: string;
  };
  metadata: {
    user_id: string;
    order_number: string;
    platform: 'feminisse-ecommerce';
  };
}

export interface PaymentResponse {
  payment_id?: string;
  preference_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  public_key?: string;
  status: string;
  status_detail?: string;
  pix?: {
    qr_code: string;
    qr_code_base64: string;
    ticket_url: string;
  };
  expires_at?: string;
}

export interface PaymentStatus {
  payment_id: string;
  status: string;
  status_detail?: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

class PaymentService {
  /**
   * Criar preferência de pagamento (Checkout Pro)
   * Token enviado automaticamente via cookies httpOnly
   */
  async createPaymentPreference(
    paymentData: PaymentData
  ): Promise<PaymentResponse> {
    try {
      const response = await api.post('/api/payments/preference', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment preference:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao criar preferência de pagamento');
    }
  }

  /**
   * Processar pagamento direto (PIX, Cartão)
   * Token enviado automaticamente via cookies httpOnly
   */
  async processDirectPayment(
    paymentData: PaymentData
  ): Promise<PaymentResponse> {
    try {
      const response = await api.post('/api/payments/process', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error processing direct payment:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao processar pagamento');
    }
  }

  /**
   * Consultar status de pagamento
   * Token enviado automaticamente via cookies httpOnly
   */
  async getPaymentStatus(
    paymentId: string
  ): Promise<PaymentStatus> {
    try {
      const response = await api.get(`/api/payments/status/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      throw new Error(error.response?.data?.details || error.response?.data?.error || 'Erro ao consultar status do pagamento');
    }
  }

  /**
   * Obter chave pública do Mercado Pago
   */
  async getPublicKey(): Promise<{ public_key: string }> {
    try {
      const response = await api.get('/api/payments/public-key');
      return response.data;
    } catch (error: any) {
      console.error('Error getting public key:', error);
      throw new Error('Erro ao obter chave pública');
    }
  }

  /**
   * Validar dados de pagamento antes do envio
   */
  validatePaymentData(paymentData: Partial<PaymentData>): string[] {
    const errors: string[] = [];

    if (!paymentData.order_id) {
      errors.push('ID do pedido é obrigatório');
    }

    if (!paymentData.payment_method) {
      errors.push('Método de pagamento é obrigatório');
    }

    if (!paymentData.total_amount || paymentData.total_amount <= 0) {
      errors.push('Valor total deve ser maior que zero');
    }

    if (!paymentData.payer) {
      errors.push('Dados do pagador são obrigatórios');
    } else {
      if (!paymentData.payer.email) {
        errors.push('Email do pagador é obrigatório');
      }
      if (!paymentData.payer.first_name) {
        errors.push('Nome do pagador é obrigatório');
      }
      if (!paymentData.payer.last_name) {
        errors.push('Sobrenome do pagador é obrigatório');
      }
    }

    if (paymentData.payment_method === 'credit_card' || paymentData.payment_method === 'debit_card') {
      if (!paymentData.card_token) {
        errors.push('Token do cartão é obrigatório');
      }
    }

    if (paymentData.installments && (paymentData.installments < 1 || paymentData.installments > 12)) {
      errors.push('Número de parcelas deve ser entre 1 e 12');
    }

    return errors;
  }

  /**
   * Formatar dados do pagador a partir dos dados do usuário
   */
  formatPayerData(user: any): PaymentData['payer'] {
    const names = user.nome?.split(' ') || ['', ''];
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || names[0] || '';

    return {
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      identification: user.cpf ? {
        type: 'CPF',
        number: user.cpf.replace(/\D/g, '')
      } : undefined
    };
  }

  /**
   * Formatar endereço de entrega
   */
  formatShippingAddress(address: any): PaymentData['shipping_address'] {
    return {
      street_name: address.street,
      street_number: address.number,
      zip_code: address.zip_code.replace(/\D/g, ''),
      city: address.city,
      state: address.state,
      neighborhood: address.neighborhood
    };
  }

  /**
   * Obter descrição do status de pagamento
   */
  getStatusDescription(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Aguardando pagamento',
      'approved': 'Pagamento aprovado',
      'authorized': 'Pagamento autorizado',
      'in_process': 'Processando pagamento',
      'in_mediation': 'Em mediação',
      'rejected': 'Pagamento rejeitado',
      'cancelled': 'Pagamento cancelado',
      'refunded': 'Pagamento estornado',
      'charged_back': 'Estornado'
    };

    return statusMap[status] || 'Status desconhecido';
  }

  /**
   * Verificar se o status indica sucesso
   */
  isSuccessStatus(status: string): boolean {
    return ['approved', 'authorized'].includes(status);
  }

  /**
   * Verificar se o status indica falha
   */
  isFailureStatus(status: string): boolean {
    return ['rejected', 'cancelled'].includes(status);
  }

  /**
   * Verificar se o status indica processamento
   */
  isPendingStatus(status: string): boolean {
    return ['pending', 'in_process', 'in_mediation'].includes(status);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
