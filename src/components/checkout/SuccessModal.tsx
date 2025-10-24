import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  total?: number;
  paymentMethod?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  total,
  paymentMethod
}) => {
  const navigate = useNavigate();
  const [hasShownConfetti, setHasShownConfetti] = React.useState(false);

  // Efeito de confete quando a modal abre (apenas 1x)
  useEffect(() => {
    if (isOpen && !hasShownConfetti) {
      setHasShownConfetti(true);
      
      const timers: NodeJS.Timeout[] = [];
      
      // Confete inicial
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Confete adicional após 200ms
      timers.push(setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 200));

      // Confete final após 400ms
      timers.push(setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400));

      // Cleanup dos timers
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
    
    // Resetar flag quando modal fechar completamente
    if (!isOpen) {
      setHasShownConfetti(false);
    }
  }, [isOpen, hasShownConfetti]);

  const handleViewOrders = () => {
    onClose();
    // Usar requestAnimationFrame em vez de setTimeout para navegação
    requestAnimationFrame(() => {
      navigate('/perfil/orders');
    });
  };

  const handleContinueShopping = () => {
    onClose();
    // Usar requestAnimationFrame em vez de setTimeout para navegação
    requestAnimationFrame(() => {
      navigate('/');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Ícone de sucesso */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Título */}
          <DialogTitle className="text-2xl font-bold text-[#58090d]">
            Pedido realizado com sucesso!
          </DialogTitle>

          {/* Descrição */}
          <DialogDescription className="text-gray-600">
            Você receberá um e-mail com os detalhes do seu pedido
          </DialogDescription>
        </DialogHeader>

        {/* Detalhes do pedido */}
        <div className="space-y-4 py-4">
          {/* Número do pedido */}
          {orderNumber && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Número do pedido:
                </span>
                <span className="text-sm font-mono text-gray-900">
                  #{orderNumber}
                </span>
              </div>
            </div>
          )}

          {/* Resumo do pagamento */}
          <div className="space-y-2">   
            {paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Método:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {paymentMethod === 'pix' ? 'PIX' : paymentMethod}
                </span>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">
                  Prazo de entrega: 5 a 10 dias úteis
                </p>
                <p className="mt-1">
                  Você receberá o código de rastreamento por e-mail assim que o pedido for enviado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleViewOrders}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Ver meus pedidos
          </Button>
          
          <Button
            onClick={handleContinueShopping}
            className="flex-1 flex items-center justify-center gap-2 bg-[#58090d] hover:bg-[#58090d]/90"
          >
            <ShoppingBag className="w-4 h-4" />
            Continuar comprando
          </Button>
        </div>

        {/* Mensagem de segurança */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            🔒 Compra 100% segura • Seus dados estão protegidos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
