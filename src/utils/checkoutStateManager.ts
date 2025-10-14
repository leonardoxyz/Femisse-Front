import { secureSessionStorage } from './secureStorage';
import { logger } from './logger';

/**
 * Gerenciador seguro de estado do checkout
 * 
 * Evita expor dados sensíveis no location.state do navegador
 * usando sessionStorage criptografado
 */

interface CheckoutRestoreData {
  selectedAddressId?: string;
  appliedCouponCode?: string;
  returnStep?: string;
  timestamp: number;
}

const RESTORE_KEY = 'checkout_restore_data';
const RESTORE_TTL = 10 * 60 * 1000; // 10 minutos

class CheckoutStateManager {
  /**
   * Salva dados para restauração posterior
   */
  saveRestoreData(data: Omit<CheckoutRestoreData, 'timestamp'>): string {
    try {
      const restoreData: CheckoutRestoreData = {
        ...data,
        timestamp: Date.now()
      };

      // Gera um ID único para esta sessão de restauração
      const restoreId = this.generateRestoreId();

      // Salva com o ID como chave
      const saved = secureSessionStorage.setItem(
        `${RESTORE_KEY}_${restoreId}`,
        restoreData,
        RESTORE_TTL
      );

      if (!saved) {
        logger.error('Falha ao salvar dados de restauração');
        return '';
      }

      logger.info('Dados de checkout salvos para restauração', {
        restoreId,
        hasAddress: !!data.selectedAddressId,
        hasCoupon: !!data.appliedCouponCode,
        returnStep: data.returnStep
      });

      return restoreId;
    } catch (error) {
      logger.error('Erro ao salvar dados de restauração:', error);
      return '';
    }
  }

  /**
   * Recupera dados de restauração pelo ID
   */
  getRestoreData(restoreId: string): CheckoutRestoreData | null {
    if (!restoreId) return null;

    try {
      const data = secureSessionStorage.getItem<CheckoutRestoreData>(
        `${RESTORE_KEY}_${restoreId}`
      );

      if (!data) {
        logger.debug('Dados de restauração não encontrados', { restoreId });
        return null;
      }

      // Verifica se expirou (double-check)
      if (Date.now() - data.timestamp > RESTORE_TTL) {
        logger.warn('Dados de restauração expirados', { restoreId });
        this.clearRestoreData(restoreId);
        return null;
      }

      logger.info('Dados de checkout recuperados', {
        restoreId,
        hasAddress: !!data.selectedAddressId,
        hasCoupon: !!data.appliedCouponCode,
        returnStep: data.returnStep
      });

      return data;
    } catch (error) {
      logger.error('Erro ao recuperar dados de restauração:', error);
      return null;
    }
  }

  /**
   * Remove dados de restauração
   */
  clearRestoreData(restoreId: string): void {
    if (!restoreId) return;

    try {
      secureSessionStorage.removeItem(`${RESTORE_KEY}_${restoreId}`);
      logger.debug('Dados de restauração removidos', { restoreId });
    } catch (error) {
      logger.error('Erro ao limpar dados de restauração:', error);
    }
  }

  /**
   * Limpa todos os dados de restauração antigos
   */
  cleanupExpiredRestoreData(): void {
    try {
      const keys = secureSessionStorage.keys();
      const restoreKeys = keys.filter(key => key.startsWith(RESTORE_KEY));

      let cleanedCount = 0;
      restoreKeys.forEach(key => {
        const data = secureSessionStorage.getItem<CheckoutRestoreData>(key);
        if (data && Date.now() - data.timestamp > RESTORE_TTL) {
          secureSessionStorage.removeItem(key);
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        logger.info(`Limpeza: ${cleanedCount} dados de restauração expirados removidos`);
      }
    } catch (error) {
      logger.error('Erro ao limpar dados expirados:', error);
    }
  }

  /**
   * Gera um ID único para restauração
   */
  private generateRestoreId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Singleton
export const checkoutStateManager = new CheckoutStateManager();

// Limpeza automática ao carregar
if (typeof window !== 'undefined') {
  checkoutStateManager.cleanupExpiredRestoreData();
}
