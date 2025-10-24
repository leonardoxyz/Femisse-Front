import { logger } from './/logger-unified';

// Utilitários para integração com Mercado Pago SDK
// Nota: O SDK será carregado dinamicamente quando necessário

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export interface MPCardToken {
  id: string;
  public_key: string;
  card_id?: string;
  luhn_validation?: boolean;
  status?: string;
  date_used?: string;
  card_number_length?: number;
  date_created?: string;
  first_six_digits?: string;
  last_four_digits?: string;
  security_code_length?: number;
  expiration_month?: number;
  expiration_year?: number;
  date_last_updated?: string;
  date_due?: string;
  live_mode?: boolean;
  cardholder?: {
    name?: string;
    identification?: {
      number?: string;
      type?: string;
    };
  };
}

export interface MPError {
  type: string;
  message: string;
  detail?: string;
  field?: string;
}

class MercadoPagoService {
  private mp: any = null;
  private publicKey: string = '';
  private isInitialized: boolean = false;

  /**
   * Inicializar SDK do Mercado Pago
   */
  async initialize(publicKey: string): Promise<void> {
    if (this.isInitialized && this.publicKey === publicKey) {
      return;
    }

    this.publicKey = publicKey;

    try {
      // Carregar SDK se não estiver disponível
      if (!window.MercadoPago) {
        await this.loadSDK();
      }

      // Inicializar com chave pública
      this.mp = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      this.isInitialized = true;
      logger.log('Mercado Pago SDK inicializado com sucesso');
    } catch (error) {
      logger.error('Erro ao inicializar Mercado Pago SDK:', error);
      throw new Error('Falha ao inicializar sistema de pagamentos');
    }
  }

  /**
   * Carregar SDK do Mercado Pago dinamicamente
   */
  private async loadSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Criar token do cartão
   */
  async createCardToken(cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType?: string;
    identificationNumber?: string;
  }): Promise<MPCardToken> {
    if (!this.isInitialized) {
      throw new Error('Mercado Pago não foi inicializado');
    }

    try {
      const tokenData = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType || 'CPF',
        identificationNumber: cardData.identificationNumber
      };

      const response = await this.mp.createCardToken(tokenData);

      if (response.error) {
        throw new Error(this.formatMPError(response.error));
      }

      return response;
    } catch (error) {
      logger.error('Erro ao criar token do cartão:', error);
      throw error;
    }
  }

  /**
   * Obter métodos de pagamento disponíveis
   */
  async getPaymentMethods(): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Mercado Pago não foi inicializado');
    }

    try {
      const response = await this.mp.getPaymentMethods();
      return response;
    } catch (error) {
      logger.error('Erro ao obter métodos de pagamento:', error);
      return [];
    }
  }

  /**
   * Obter informações do cartão por BIN
   */
  async getCardInfo(bin: string): Promise<any> {
    if (!this.isInitialized || bin.length < 6) {
      return null;
    }

    try {
      const response = await this.mp.getPaymentMethods({
        bin: bin.substring(0, 6)
      });

      return response.results?.[0] || null;
    } catch (error) {
      logger.error('Erro ao obter informações do cartão:', error);
      return null;
    }
  }

  /**
   * Validar número do cartão
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Validação básica de comprimento
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    // Algoritmo de Luhn
    let sum = 0;
    let alternate = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cleanNumber.charAt(i), 10);

      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }

      sum += n;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  /**
   * Validar CVV
   */
  validateCVV(cvv: string, cardNumber?: string): boolean {
    const cleanCVV = cvv.replace(/\D/g, '');
    
    // American Express tem 4 dígitos, outros têm 3
    const isAmex = cardNumber?.replace(/\s/g, '').startsWith('34') || 
                   cardNumber?.replace(/\s/g, '').startsWith('37');
    
    const expectedLength = isAmex ? 4 : 3;
    
    return cleanCVV.length === expectedLength;
  }

  /**
   * Validar data de expiração
   */
  validateExpirationDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    // Ajustar ano se for de 2 dígitos
    const fullYear = expYear < 100 ? 2000 + expYear : expYear;

    if (expMonth < 1 || expMonth > 12) {
      return false;
    }

    if (fullYear < currentYear) {
      return false;
    }

    if (fullYear === currentYear && expMonth < currentMonth) {
      return false;
    }

    return true;
  }

  /**
   * Formatar erros do Mercado Pago
   */
  private formatMPError(error: MPError): string {
    const errorMessages: Record<string, string> = {
      'invalid_card_number': 'Número do cartão inválido',
      'invalid_expiry_date': 'Data de vencimento inválida',
      'invalid_security_code': 'Código de segurança inválido',
      'invalid_cardholder_name': 'Nome do portador inválido',
      'invalid_identification_number': 'Número de documento inválido',
      'card_number_required': 'Número do cartão é obrigatório',
      'expiry_date_required': 'Data de vencimento é obrigatória',
      'security_code_required': 'Código de segurança é obrigatório',
      'cardholder_name_required': 'Nome do portador é obrigatório'
    };

    return errorMessages[error.type] || error.message || 'Erro no processamento do cartão';
  }

  /**
   * Detectar bandeira do cartão
   */
  getCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]|^2[2-7]/,
      amex: /^3[47]/,
      diners: /^3[0689]/,
      discover: /^6(?:011|5)/,
      elo: /^4011|^4312|^4389|^4514|^4573|^6277|^6362|^6363/,
      hipercard: /^606282|^637095|^637568|^637599|^637609|^637612/
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return brand;
      }
    }

    return 'unknown';
  }

  /**
   * Limpar instância
   */
  destroy(): void {
    this.mp = null;
    this.isInitialized = false;
    this.publicKey = '';
  }
}

// Instância singleton
export const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
