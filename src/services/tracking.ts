import api from '@/utils/api';
import { logger } from '../utils/logger-unified';

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  date: string;
  location?: string;
}

export interface TrackingInfo {
  order_id: string;
  tracking_code: string;
  carrier: string;
  status: string;
  estimated_delivery?: string;
  events: TrackingEvent[];
  last_update: string;
}

class TrackingService {
  /**
   * Buscar informações de rastreamento de um pedido
   */
  async getTrackingInfo(orderId: string): Promise<TrackingInfo> {
    try {
      const response = await api.get(`/api/orders/${orderId}/tracking`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching tracking info:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar informações de rastreamento');
    }
  }

  /**
   * Verificar se um pedido pode ser rastreado
   */
  canTrackOrder(order: any): boolean {
    // Pedido pode ser rastreado se:
    // 1. Tem código de rastreamento
    // 2. Status é 'processing', 'shipped' ou 'delivered'
    // 3. Não está cancelado
    return (
      order.tracking_code && 
      ['processing', 'shipped', 'delivered'].includes(order.status) &&
      order.status !== 'cancelled'
    );
  }

  /**
   * Formatar status de rastreamento para exibição
   */
  formatTrackingStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'posted': 'Postado',
      'in_transit': 'Em trânsito',
      'out_for_delivery': 'Saiu para entrega',
      'delivered': 'Entregue',
      'exception': 'Ocorrência',
      'returned': 'Devolvido',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obter cor do badge baseado no status de rastreamento
   */
  getTrackingStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'posted': 'blue',
      'in_transit': 'purple',
      'out_for_delivery': 'yellow',
      'delivered': 'green',
      'exception': 'red',
      'returned': 'gray',
      'cancelled': 'red'
    };
    
    return colorMap[status] || 'gray';
  }

  /**
   * Verificar se há atualizações de rastreamento
   * (Para uso futuro com polling ou websockets)
   */
  async checkForUpdates(orderId: string, lastUpdate: string): Promise<boolean> {
    try {
      const response = await api.get(`/api/orders/${orderId}/tracking/updates`, {
        params: { since: lastUpdate },
        withCredentials: true
      });
      return response.data.hasUpdates;
    } catch (error) {
      logger.error('Error checking tracking updates:', error);
      return false;
    }
  }
}

export const trackingService = new TrackingService();
export default trackingService;
