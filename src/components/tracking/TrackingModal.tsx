import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trackingService, TrackingInfo, TrackingEvent } from '@/services/tracking';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

export const TrackingModal = ({ isOpen, onClose, orderId, orderNumber }: TrackingModalProps) => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      loadTrackingInfo();
    }
  }, [isOpen, orderId]);

  const loadTrackingInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const info = await trackingService.getTrackingInfo(orderId);
      setTrackingInfo(info);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar informações de rastreamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return <Package className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'out_for_delivery':
        return <MapPin className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'exception':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Rastreamento - Pedido #{orderNumber}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#58090d]"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={loadTrackingInfo} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        )}

        {trackingInfo && (
          <div className="space-y-6">
            {/* Status atual */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Status atual</h3>
                <Badge 
                  variant="secondary"
                  className={`bg-${trackingService.getTrackingStatusColor(trackingInfo.status)}-100 text-${trackingService.getTrackingStatusColor(trackingInfo.status)}-800`}
                >
                  {trackingService.formatTrackingStatus(trackingInfo.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Código de rastreamento</p>
                  <p className="font-mono">{trackingInfo.tracking_code}</p>
                </div>
                <div>
                  <p className="text-gray-600">Transportadora</p>
                  <p>{trackingInfo.carrier}</p>
                </div>
                {trackingInfo.estimated_delivery && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Previsão de entrega</p>
                    <p>{formatDate(trackingInfo.estimated_delivery)}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Histórico de eventos */}
            <div>
              <h3 className="font-semibold mb-4">Histórico de rastreamento</h3>
              <div className="space-y-4">
                {trackingInfo.events.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-[#58090d] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getEventIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {trackingService.formatTrackingStatus(event.status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Última atualização */}
            <div className="text-xs text-gray-500 text-center">
              Última atualização: {formatDate(trackingInfo.last_update)}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {trackingInfo && (
            <Button onClick={loadTrackingInfo}>
              Atualizar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingModal;
