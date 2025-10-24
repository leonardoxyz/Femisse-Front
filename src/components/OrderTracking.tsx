/**
 * COMPONENTE DE RASTREAMENTO DE PEDIDO
 * 
 * Exibe status e histórico de rastreamento de envios
 */

import { useEffect, useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Printer,
  XCircle
} from 'lucide-react';
import { useShipping } from '@/hooks/useShipping';
import { translateLabelStatus, translateEventType } from '@/services/shipping';
import type { ShippingLabel, ShippingEvent } from '@/services/shipping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logger } from '../utils/logger-unified';

interface OrderTrackingProps {
  labelId: string;
  orderId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function OrderTracking({
  labelId,
  orderId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 segundos
  className = ''
}: OrderTrackingProps) {
  const { 
    loading, 
    currentLabel, 
    events, 
    loadLabel, 
    printLabel,
    startTrackingPolling 
  } = useShipping();
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadLabel(labelId);
  }, [labelId, loadLabel]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const stopPolling = startTrackingPolling(labelId, refreshInterval);
    
    return () => stopPolling();
  }, [labelId, autoRefresh, refreshInterval, startTrackingPolling]);

  useEffect(() => {
    setLastUpdate(new Date());
  }, [currentLabel, events]);

  const handlePrint = async () => {
    try {
      await printLabel(labelId);
    } catch (error) {
      logger.error('Erro ao imprimir etiqueta:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      released: CheckCircle,
      generated: Package,
      posted: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      undelivered: AlertCircle,
      paused: AlertCircle,
      suspended: AlertCircle
    };
    
    return icons[status] || Package;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      released: 'bg-blue-100 text-blue-800',
      generated: 'bg-purple-100 text-purple-800',
      posted: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      undelivered: 'bg-orange-100 text-orange-800',
      paused: 'bg-amber-100 text-amber-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !currentLabel) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Carregando rastreamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentLabel) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-gray-600">
            <AlertCircle className="w-5 h-5" />
            <span>Informações de rastreamento não disponíveis</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(currentLabel.status);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Rastreamento de Envio</CardTitle>
            {currentLabel.protocol && (
              <p className="text-sm text-gray-500 mt-1">
                Protocolo: {currentLabel.protocol}
              </p>
            )}
          </div>
          
          <Badge className={getStatusColor(currentLabel.status)}>
            {translateLabelStatus(currentLabel.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Atual */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <StatusIcon className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {translateLabelStatus(currentLabel.status)}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>{currentLabel.company_name} - {currentLabel.service_name}</span>
              </div>
              
              {currentLabel.tracking_code && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Código: {currentLabel.tracking_code}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Última atualização: {lastUpdate.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {currentLabel.tracking_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentLabel.tracking_url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Rastrear no Site
            </Button>
          )}
          
          {currentLabel.label_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Etiqueta
            </Button>
          )}
        </div>

        {/* Histórico de Eventos */}
        {events.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Histórico de Movimentação
            </h4>
            
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${
                          index === 0 ? 'text-primary' : 'text-gray-900'
                        }`}>
                          {translateEventType(event.event_type)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(event.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {event.processed && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
          <div>
            <span className="text-gray-500">Valor do Frete:</span>
            <p className="font-medium text-gray-900">
              R$ {currentLabel.price.toFixed(2)}
            </p>
          </div>
          
          {currentLabel.posted_at && (
            <div>
              <span className="text-gray-500">Data de Postagem:</span>
              <p className="font-medium text-gray-900">
                {new Date(currentLabel.posted_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          
          {currentLabel.delivered_at && (
            <div>
              <span className="text-gray-500">Data de Entrega:</span>
              <p className="font-medium text-gray-900">
                {new Date(currentLabel.delivered_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderTracking;
