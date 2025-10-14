/**
 * HOOK DE SHIPPING - MELHOR ENVIO
 * 
 * Hook React para gerenciar operações de frete e envio
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as shippingService from '@/services/shipping';
import type {
  ShippingQuote,
  ShippingLabel,
  ShippingEvent,
  CalculateShippingRequest,
  CreateLabelRequest
} from '@/services/shipping';

export function useShipping() {
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [currentLabel, setCurrentLabel] = useState<ShippingLabel | null>(null);
  const [events, setEvents] = useState<ShippingEvent[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // =====================================================
  // AUTENTICAÇÃO
  // =====================================================

  /**
   * Verifica se usuário está autorizado
   */
  const checkAuthorization = useCallback(async () => {
    try {
      const status = await shippingService.checkAuthStatus();
      setAuthorized(status.authorized);
      return status;
    } catch (error: any) {
      console.error('Erro ao verificar autorização:', error);
      setAuthorized(false);
      return { authorized: false };
    }
  }, []);

  /**
   * Inicia processo de autorização
   */
  const authorize = useCallback(async () => {
    try {
      const { authorizationUrl } = await shippingService.initiateAuthorization();
      
      // Abre em nova janela
      window.open(authorizationUrl, '_blank', 'width=600,height=800');
      
      toast.info('Autorize o aplicativo na janela aberta');
      
      return authorizationUrl;
    } catch (error: any) {
      console.error('Erro ao iniciar autorização:', error);
      toast.error(error.response?.data?.error || 'Erro ao iniciar autorização');
      throw error;
    }
  }, []);

  // =====================================================
  // COTAÇÃO DE FRETES
  // =====================================================

  /**
   * Calcula cotação de frete
   */
  const calculateShipping = useCallback(async (data: CalculateShippingRequest) => {
    setLoading(true);
    try {
      const result = await shippingService.calculateShipping(data);
      setQuotes(result.quotes);
      
      if (result.quotes.length === 0) {
        toast.warning('Nenhuma opção de frete disponível para este endereço');
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      
      // Verifica se é erro de autorização
      if (error.response?.status === 401 || error.response?.data?.error?.includes('autorizar')) {
        toast.error('Você precisa autorizar o MelhorEnvio primeiro');
        setAuthorized(false);
      } else {
        toast.error(error.response?.data?.error || 'Erro ao calcular frete');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista cotações salvas
   */
  const loadQuotes = useCallback(async (orderId?: string) => {
    setLoading(true);
    try {
      const result = await shippingService.listQuotes(orderId);
      setQuotes(result);
      return result;
    } catch (error: any) {
      console.error('Erro ao listar cotações:', error);
      toast.error('Erro ao carregar cotações');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // ETIQUETAS DE ENVIO
  // =====================================================

  /**
   * Cria etiqueta de envio
   */
  const createLabel = useCallback(async (data: CreateLabelRequest) => {
    setLoading(true);
    try {
      const result = await shippingService.createLabel(data);
      
      toast.success('Etiqueta criada com sucesso!');
      
      return result.label;
    } catch (error: any) {
      console.error('Erro ao criar etiqueta:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar etiqueta');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista etiquetas do usuário
   */
  const loadLabels = useCallback(async (filters?: { orderId?: string; status?: string }) => {
    setLoading(true);
    try {
      const result = await shippingService.listLabels(filters);
      setLabels(result);
      return result;
    } catch (error: any) {
      console.error('Erro ao listar etiquetas:', error);
      toast.error('Erro ao carregar etiquetas');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca etiqueta por ID
   */
  const loadLabel = useCallback(async (labelId: string) => {
    setLoading(true);
    try {
      const result = await shippingService.getLabelById(labelId);
      setCurrentLabel(result);
      setEvents(result.events || []);
      return result;
    } catch (error: any) {
      console.error('Erro ao buscar etiqueta:', error);
      toast.error('Erro ao carregar etiqueta');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gera etiqueta (após pagamento)
   */
  const generateLabel = useCallback(async (labelId: string) => {
    setLoading(true);
    try {
      await shippingService.generateLabel(labelId);
      toast.success('Etiqueta gerada com sucesso!');
      
      // Recarrega etiqueta
      await loadLabel(labelId);
    } catch (error: any) {
      console.error('Erro ao gerar etiqueta:', error);
      toast.error(error.response?.data?.error || 'Erro ao gerar etiqueta');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadLabel]);

  /**
   * Imprime etiqueta
   */
  const printLabel = useCallback(async (labelId: string) => {
    setLoading(true);
    try {
      const result = await shippingService.printLabel(labelId);
      
      // Abre PDF em nova aba
      window.open(result.url, '_blank');
      
      toast.success('Etiqueta pronta para impressão!');
      
      return result.url;
    } catch (error: any) {
      console.error('Erro ao imprimir etiqueta:', error);
      toast.error(error.response?.data?.error || 'Erro ao imprimir etiqueta');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancela etiqueta
   */
  const cancelLabel = useCallback(async (labelId: string, reason?: string) => {
    setLoading(true);
    try {
      await shippingService.cancelLabel(labelId, reason);
      toast.success('Etiqueta cancelada com sucesso');
      
      // Recarrega etiqueta
      await loadLabel(labelId);
    } catch (error: any) {
      console.error('Erro ao cancelar etiqueta:', error);
      toast.error(error.response?.data?.error || 'Erro ao cancelar etiqueta');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadLabel]);

  // =====================================================
  // RASTREAMENTO
  // =====================================================

  /**
   * Rastreia envio
   */
  const trackShipment = useCallback(async (labelId: string) => {
    setLoading(true);
    try {
      const result = await shippingService.trackShipment(labelId);
      return result;
    } catch (error: any) {
      console.error('Erro ao rastrear envio:', error);
      toast.error('Erro ao rastrear envio');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista eventos de rastreamento
   */
  const loadEvents = useCallback(async (labelId: string) => {
    try {
      const result = await shippingService.listLabelEvents(labelId);
      setEvents(result);
      return result;
    } catch (error: any) {
      console.error('Erro ao listar eventos:', error);
      throw error;
    }
  }, []);

  /**
   * Atualiza rastreamento periodicamente
   */
  const startTrackingPolling = useCallback((labelId: string, intervalMs: number = 30000) => {
    const interval = setInterval(async () => {
      try {
        await loadLabel(labelId);
      } catch (error) {
        console.error('Erro ao atualizar rastreamento:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [loadLabel]);

  return {
    // Estado
    loading,
    quotes,
    labels,
    currentLabel,
    events,
    authorized,
    
    // Autenticação
    checkAuthorization,
    authorize,
    
    // Cotação
    calculateShipping,
    loadQuotes,
    
    // Etiquetas
    createLabel,
    loadLabels,
    loadLabel,
    generateLabel,
    printLabel,
    cancelLabel,
    
    // Rastreamento
    trackShipment,
    loadEvents,
    startTrackingPolling
  };
}

export default useShipping;
