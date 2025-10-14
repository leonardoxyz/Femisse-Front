/**
 * SERVIÇO DE SHIPPING - MELHOR ENVIO
 * 
 * Gerencia todas as requisições relacionadas a fretes e envios
 */

import api from './api';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface ShippingProduct {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insuranceValue?: number;
  quantity?: number;
}

export interface ShippingQuote {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: number;
  custom_price: number;
  discount: number;
  delivery_time: number;
  custom_delivery_time: number;
  delivery_range?: {
    min: number;
    max: number;
  };
  packages: any[];
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  document: string;
  companyDocument?: string;
  stateRegister?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  note?: string;
}

export interface ShippingLabel {
  id: string;
  order_id: string;
  melhorenvio_order_id: string;
  protocol: string;
  status: string;
  tracking_code?: string;
  tracking_url?: string;
  label_url?: string;
  price: number;
  service_name: string;
  company_name: string;
  created_at: string;
  paid_at?: string;
  generated_at?: string;
  posted_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface ShippingEvent {
  id: string;
  event_type: string;
  status: string;
  tracking_code?: string;
  created_at: string;
  processed: boolean;
}

export interface CalculateShippingRequest {
  fromZipCode: string;
  toZipCode: string;
  products: ShippingProduct[];
  orderId?: string;
  receipt?: boolean;
  ownHand?: boolean;
  collect?: boolean;
}

export interface CreateLabelRequest {
  orderId: string;
  serviceId: number;
  serviceName: string;
  companyId: number;
  companyName: string;
  quoteId?: string;
  from: ShippingAddress;
  to: ShippingAddress;
  products: Array<{
    name: string;
    quantity: number;
    unitaryValue: number;
    weight: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  insuranceValue?: number;
  receipt?: boolean;
  ownHand?: boolean;
  collect?: boolean;
  reverse?: boolean;
  nonCommercial?: boolean;
  invoice?: {
    key: string;
  };
  tags?: Array<{
    tag: string;
    url: string;
  }>;
}

// =====================================================
// AUTENTICAÇÃO OAUTH2
// =====================================================

/**
 * Inicia processo de autorização OAuth2
 */
export async function initiateAuthorization(): Promise<{ authorizationUrl: string }> {
  const response = await api.get('/shipping/auth/authorize');
  return response.data;
}

/**
 * Verifica status de autorização do usuário
 */
export async function checkAuthStatus(): Promise<{
  authorized: boolean;
  expiresAt?: string;
  authorizedSince?: string;
}> {
  const response = await api.get('/shipping/auth/status');
  return response.data;
}

// =====================================================
// COTAÇÃO DE FRETES
// =====================================================

/**
 * Calcula cotação de frete
 */
export async function calculateShipping(
  data: CalculateShippingRequest
): Promise<{ quotes: ShippingQuote[]; savedQuotes: any[] }> {
  const response = await api.post('/shipping/calculate', data);
  return response.data;
}

/**
 * Lista cotações salvas do usuário
 */
export async function listQuotes(orderId?: string): Promise<any[]> {
  const params = orderId ? { order_id: orderId } : {};
  const response = await api.get('/shipping/quotes', { params });
  return response.data;
}

// =====================================================
// ETIQUETAS DE ENVIO
// =====================================================

/**
 * Cria etiqueta de envio
 */
export async function createLabel(
  data: CreateLabelRequest
): Promise<{ label: ShippingLabel }> {
  const response = await api.post('/shipping/labels', data);
  return response.data;
}

/**
 * Lista etiquetas do usuário
 */
export async function listLabels(filters?: {
  orderId?: string;
  status?: string;
}): Promise<ShippingLabel[]> {
  const params: any = {};
  if (filters?.orderId) params.order_id = filters.orderId;
  if (filters?.status) params.status = filters.status;
  
  const response = await api.get('/shipping/labels', { params });
  return response.data;
}

/**
 * Busca etiqueta por ID
 */
export async function getLabelById(
  labelId: string
): Promise<ShippingLabel & { events: ShippingEvent[] }> {
  const response = await api.get(`/shipping/labels/${labelId}`);
  return response.data;
}

/**
 * Gera etiqueta (após pagamento)
 */
export async function generateLabel(labelId: string): Promise<{ success: boolean }> {
  const response = await api.post(`/shipping/labels/${labelId}/generate`);
  return response.data;
}

/**
 * Imprime etiqueta (retorna URL do PDF)
 */
export async function printLabel(labelId: string): Promise<{ url: string }> {
  const response = await api.post(`/shipping/labels/${labelId}/print`);
  return response.data;
}

/**
 * Cancela etiqueta
 */
export async function cancelLabel(
  labelId: string,
  reason?: string
): Promise<{ success: boolean }> {
  const response = await api.post(`/shipping/labels/${labelId}/cancel`, { reason });
  return response.data;
}

// =====================================================
// RASTREAMENTO
// =====================================================

/**
 * Rastreia envio
 */
export async function trackShipment(labelId: string): Promise<any> {
  const response = await api.get(`/shipping/track/${labelId}`);
  return response.data;
}

/**
 * Lista eventos de rastreamento
 */
export async function listLabelEvents(labelId: string): Promise<ShippingEvent[]> {
  const response = await api.get(`/shipping/labels/${labelId}/events`);
  return response.data;
}

// =====================================================
// UTILITÁRIOS
// =====================================================

/**
 * Formata CEP
 */
export function formatZipCode(zipCode: string): string {
  const cleaned = zipCode.replace(/\D/g, '');
  if (cleaned.length !== 8) return zipCode;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}

/**
 * Remove formatação do CEP
 */
export function cleanZipCode(zipCode: string): string {
  return zipCode.replace(/\D/g, '');
}

/**
 * Traduz status da etiqueta
 */
export function translateLabelStatus(status: string): string {
  const translations: Record<string, string> = {
    pending: 'Pendente',
    released: 'Pago',
    generated: 'Etiqueta Gerada',
    posted: 'Postado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    undelivered: 'Não Entregue',
    paused: 'Pausado',
    suspended: 'Suspenso',
    expired: 'Expirado'
  };
  
  return translations[status] || status;
}

/**
 * Traduz tipo de evento
 */
export function translateEventType(eventType: string): string {
  const translations: Record<string, string> = {
    'order.created': 'Pedido Criado',
    'order.pending': 'Aguardando Pagamento',
    'order.released': 'Pagamento Confirmado',
    'order.generated': 'Etiqueta Gerada',
    'order.received': 'Recebido no Centro de Distribuição',
    'order.posted': 'Postado',
    'order.delivered': 'Entregue',
    'order.cancelled': 'Cancelado',
    'order.undelivered': 'Não Entregue',
    'order.paused': 'Entrega Pausada',
    'order.suspended': 'Entrega Suspensa'
  };
  
  return translations[eventType] || eventType;
}

/**
 * Calcula dimensões de um produto para envio
 */
export function calculateProductDimensions(product: any): ShippingProduct {
  // Valores padrão caso não estejam definidos
  const defaultDimensions = {
    width: 11, // cm
    height: 17, // cm
    length: 11, // cm
    weight: 0.3 // kg
  };
  
  return {
    id: product.id,
    width: product.width || defaultDimensions.width,
    height: product.height || defaultDimensions.height,
    length: product.length || defaultDimensions.length,
    weight: product.weight || defaultDimensions.weight,
    insuranceValue: product.price || 0,
    quantity: product.quantity || 1
  };
}

/**
 * Agrupa produtos em volumes para envio
 */
export function groupProductsIntoVolumes(products: ShippingProduct[]): Array<{
  height: number;
  width: number;
  length: number;
  weight: number;
}> {
  // Estratégia simples: um volume por produto
  // Em produção, você pode implementar lógica mais complexa
  return products.map(product => ({
    height: product.height,
    width: product.width,
    length: product.length,
    weight: product.weight * (product.quantity || 1)
  }));
}

export default {
  // Auth
  initiateAuthorization,
  checkAuthStatus,
  
  // Quotes
  calculateShipping,
  listQuotes,
  
  // Labels
  createLabel,
  listLabels,
  getLabelById,
  generateLabel,
  printLabel,
  cancelLabel,
  
  // Tracking
  trackShipment,
  listLabelEvents,
  
  // Utils
  formatZipCode,
  cleanZipCode,
  translateLabelStatus,
  translateEventType,
  calculateProductDimensions,
  groupProductsIntoVolumes
};
