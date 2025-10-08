import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, QrCode, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PaymentResponse, PaymentStatus, paymentService } from '@/services/payment';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusProps {
  payment: PaymentResponse;
  onStatusChange?: (status: string) => void;
  token: string;
}

const PaymentStatusComponent: React.FC<PaymentStatusProps> = ({
  payment,
  onStatusChange,
  token
}) => {
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const { toast } = useToast();

  // Polling para atualizar status do pagamento
  useEffect(() => {
    if (!payment.payment_id) return;

    const checkPaymentStatus = async () => {
      try {
        const status = await paymentService.getPaymentStatus(payment.payment_id!, token);
        setCurrentStatus(status);
        onStatusChange?.(status.status);
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    };

    // Verificar imediatamente
    checkPaymentStatus();

    // Polling a cada 10 segundos para pagamentos pendentes (reduzido de 5s)
    const interval = setInterval(() => {
      if (currentStatus && paymentService.isPendingStatus(currentStatus.status)) {
        checkPaymentStatus();
      }
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [payment.payment_id, token, onStatusChange, currentStatus]);

  const refreshStatus = async () => {
    if (!payment.payment_id) return;

    setIsRefreshing(true);
    try {
      const status = await paymentService.getPaymentStatus(payment.payment_id, token);
      setCurrentStatus(status);
      onStatusChange?.(status.status);
      
      toast({
        title: "Status atualizado",
        description: paymentService.getStatusDescription(status.status),
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível verificar o status do pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyPixCode = async () => {
    if (!payment.pix?.qr_code) return;

    try {
      await navigator.clipboard.writeText(payment.pix.qr_code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
      
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app de pagamentos para finalizar.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código PIX.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    if (paymentService.isSuccessStatus(status)) {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
    if (paymentService.isFailureStatus(status)) {
      return <XCircle className="h-8 w-8 text-red-600" />;
    }
    return <Clock className="h-8 w-8 text-yellow-600" />;
  };

  const getStatusColor = (status: string) => {
    if (paymentService.isSuccessStatus(status)) return 'bg-green-100 text-green-800';
    if (paymentService.isFailureStatus(status)) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const status = currentStatus?.status || payment.status;
  const statusDescription = paymentService.getStatusDescription(status);

  return (
    <div className="space-y-6">
      {/* Status principal */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(status)}
          </div>
          <CardTitle className="text-xl">
            {paymentService.isSuccessStatus(status) && "Pagamento Aprovado!"}
            {paymentService.isFailureStatus(status) && "Pagamento Rejeitado"}
            {paymentService.isPendingStatus(status) && "Aguardando Pagamento"}
          </CardTitle>
          <CardDescription>
            <Badge className={getStatusColor(status)}>
              {statusDescription}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações do pagamento */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID do Pagamento:</span>
              <p className="text-muted-foreground">{payment.payment_id || 'Gerando...'}</p>
            </div>
            <div>
              <span className="font-medium">Valor:</span>
              <p className="text-muted-foreground">
                {currentStatus?.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Carregando...'}
              </p>
            </div>
            <div>
              <span className="font-medium">Método:</span>
              <p className="text-muted-foreground">
                {currentStatus?.payment_method || payment.status}
              </p>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <p className="text-muted-foreground">
                {currentStatus?.created_at ? new Date(currentStatus.created_at).toLocaleString('pt-BR') : 'Agora'}
              </p>
            </div>
          </div>

          {/* Botão de atualizar status */}
          <Button
            variant="outline"
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Verificando...' : 'Atualizar Status'}
          </Button>
        </CardContent>
      </Card>

      {/* PIX específico */}
      {payment.pix && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Pagamento PIX
            </CardTitle>
            <CardDescription>
              Escaneie o QR Code ou copie o código para pagar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* QR Code */}
            {payment.pix.qr_code_base64 && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${payment.pix.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 border rounded-lg"
                />
              </div>
            )}

            {/* Código PIX */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Código PIX:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={payment.pix.qr_code}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPixCode}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  {pixCopied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Link para abrir no app */}
            {payment.pix.ticket_url && (
              <Button
                variant="outline"
                onClick={() => window.open(payment.pix.ticket_url, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir no app de pagamentos
              </Button>
            )}

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                O PIX expira em 30 minutos. Após o pagamento, a confirmação é automática.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Checkout Pro (redirecionamento) */}
      {payment.init_point && (
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Pagamento</CardTitle>
            <CardDescription>
              Você será redirecionado para completar o pagamento
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={() => window.open(payment.init_point, '_blank')}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ir para o pagamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instruções baseadas no status */}
      {paymentService.isPendingStatus(status) && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
          </AlertDescription>
        </Alert>
      )}

      {paymentService.isSuccessStatus(status) && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Pagamento confirmado! Seu pedido está sendo preparado para envio.
          </AlertDescription>
        </Alert>
      )}

      {paymentService.isFailureStatus(status) && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Pagamento não foi aprovado. Verifique os dados e tente novamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentStatusComponent;
