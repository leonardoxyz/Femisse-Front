import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { CreditCard, Smartphone, QrCode, Shield, AlertCircle } from 'lucide-react';
import { useSecureForm } from '@/hooks/useSecureForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mercadoPagoService } from '@/utils/mercadopago';
import { paymentService } from '@/services/payment';
import { useToast } from '@/hooks/use-toast';
import { validateCPF, formatCPF } from '@/utils/validators';

// Schema de validação para dados de pagamento
const paymentSchema = z.object({
  payment_method: z.enum(['pix', 'credit_card', 'debit_card']),
  card_number: z.string().optional(),
  card_holder_name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  card_expiry_month: z.string().optional(),
  card_expiry_year: z.string().optional(),
  card_cvv: z.string().optional(),
  installments: z.number().min(1).max(12).default(1),
  document_type: z.enum(['CPF']).default('CPF'),
  document_number: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números')
    .refine(validateCPF, 'CPF inválido'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onPaymentDataChange?: (data: PaymentFormData & { card_token?: string }, isValid: boolean) => void;
  totalAmount: number;
  initialCPF?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentDataChange,
  totalAmount,
  initialCPF
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('pix');
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);
  const { toast } = useToast();

  const {
    data,
    errors,
    isValid,
    setValue,
    getFieldProps
  } = useSecureForm({
    schema: paymentSchema,
    onSubmit: async () => {}
  });

  // Auto-preencher CPF do perfil se fornecido
  useEffect(() => {
    if (initialCPF && !data.document_number) {
      // Remove formatação do CPF se houver
      const cleanCPF = initialCPF.replace(/\D/g, '');
      setValue('document_number', cleanCPF);
    }
  }, [initialCPF, data.document_number, setValue]);

  // Gerar token automaticamente quando os dados do cartão estiverem completos
  useEffect(() => {
    if (selectedMethod !== 'pix' && mpInitialized && !cardToken) {
      const cardNumber = data.card_number?.replace(/\s/g, '') || '';
      const cardholderName = data.card_holder_name || '';
      const expiryMonth = data.card_expiry_month || '';
      const expiryYear = data.card_expiry_year || '';
      const cvv = data.card_cvv || '';
      const docNumber = data.document_number?.replace(/\D/g, '') || '';

      // Se todos os campos estiverem preenchidos, gerar token automaticamente
      if (cardNumber && cardholderName && expiryMonth && expiryYear && cvv && docNumber.length === 11) {
        generateCardToken();
      }
    }
  }, [data, selectedMethod, mpInitialized, cardToken]);

  // Notificar mudanças nos dados de pagamento
  useEffect(() => {
    if (onPaymentDataChange) {
      const paymentData = { ...data, card_token: cardToken || undefined };
      const isFormValid = isValid && (selectedMethod === 'pix' || !!cardToken);
      onPaymentDataChange(paymentData, isFormValid);
    }
  }, [data, cardToken, isValid, selectedMethod, onPaymentDataChange]);

  // Inicializar Mercado Pago
  useEffect(() => {
    const initializeMercadoPago = async () => {
      try {
        const { public_key } = await paymentService.getPublicKey();
        await mercadoPagoService.initialize(public_key);
        setMpInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
        toast({
          title: "Erro de inicialização",
          description: "Não foi possível inicializar o sistema de pagamentos.",
          variant: "destructive",
        });
      }
    };

    initializeMercadoPago();
  }, [toast]);

  // Atualizar método de pagamento
  useEffect(() => {
    setValue('payment_method', selectedMethod as any);
  }, [selectedMethod, setValue]);

  // Gerar token do cartão com Mercado Pago
  const generateCardToken = async () => {
    if (selectedMethod === 'pix' || !mpInitialized) return;

    const cardNumber = data.card_number?.replace(/\s/g, '') || '';
    const cardholderName = data.card_holder_name || '';
    const expiryMonth = data.card_expiry_month || '';
    const expiryYear = data.card_expiry_year || '';
    const cvv = data.card_cvv || '';
    const docNumber = data.document_number?.replace(/\D/g, '') || '';

    // Validações básicas
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os dados do cartão antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validar número do cartão
    if (!mercadoPagoService.validateCardNumber(cardNumber)) {
      toast({
        title: "Cartão inválido",
        description: "Número do cartão inválido.",
        variant: "destructive",
      });
      return;
    }

    // Validar CVV
    if (!mercadoPagoService.validateCVV(cvv, cardNumber)) {
      toast({
        title: "CVV inválido",
        description: "Código de segurança inválido.",
        variant: "destructive",
      });
      return;
    }

    // Validar data de expiração
    if (!mercadoPagoService.validateExpirationDate(expiryMonth, expiryYear)) {
      toast({
        title: "Data inválida",
        description: "Data de vencimento inválida.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingToken(true);
    try {
      const token = await mercadoPagoService.createCardToken({
        cardNumber,
        cardholderName,
        cardExpirationMonth: expiryMonth,
        cardExpirationYear: expiryYear,
        securityCode: cvv,
        identificationType: 'CPF',
        identificationNumber: docNumber
      });

      setCardToken(token.id);
      
      toast({
        title: "Cartão validado",
        description: "Dados do cartão validados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar token do cartão:', error);
      toast({
        title: "Erro na validação",
        description: error instanceof Error ? error.message : "Erro ao validar cartão.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .slice(0, 19);
  };

  // Formatar CVV
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      description: 'Aprovação instantânea',
      icon: <QrCode className="h-5 w-5" />,
      benefits: ['Confirmação imediata', 'Disponível 24h', 'Sem taxas']
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Parcelamento em até 12x',
      icon: <CreditCard className="h-5 w-5" />,
      benefits: ['Parcele sem juros', 'Principais bandeiras', 'Proteção total']
    },
    {
      id: 'debit_card',
      name: 'Cartão de Débito',
      description: 'Débito à vista',
      icon: <Smartphone className="h-5 w-5" />,
      benefits: ['Pagamento direto', 'Processamento seguro', 'Sem limite de crédito']
    }
  ];

  const installmentOptions = [
    { value: 1, label: `1x de ${(totalAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros` },
    { value: 2, label: `2x de ${(totalAmount / 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros` },
    { value: 3, label: `3x de ${(totalAmount / 3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros` },
    { value: 6, label: `6x de ${(totalAmount / 6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros` },
    { value: 12, label: `12x de ${(totalAmount / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros` },
  ];

  return (
    <div className="space-y-6">
      {/* Seleção do método de pagamento */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Escolha a forma de pagamento</Label>
        
        <RadioGroup
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="grid gap-3 sm:grid-cols-3"
        >
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative">
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className="flex flex-col gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {method.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Campos específicos para cartão */}
      {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-green-600" />
            Dados do cartão (criptografados)
          </div>

          <div className="grid gap-4">
            {/* Número do cartão */}
            <div className="space-y-2">
              <Label htmlFor="card_number">Número do cartão</Label>
              <Input
                id="card_number"
                placeholder="0000 0000 0000 0000"
                value={formatCardNumber(data.card_number || '')}
                onChange={(e) => setValue('card_number', e.target.value.replace(/\s/g, ''))}
                maxLength={19}
                className={errors.card_number ? 'border-red-500' : ''}
              />
              {errors.card_number && (
                <p className="text-sm text-red-500">{errors.card_number}</p>
              )}
            </div>

            {/* Nome no cartão */}
            <div className="space-y-2">
              <Label htmlFor="card_holder_name">Nome no cartão</Label>
              <Input
                id="card_holder_name"
                placeholder="Nome como está no cartão"
                {...getFieldProps('card_holder_name')}
                className={errors.card_holder_name ? 'border-red-500' : ''}
              />
              {errors.card_holder_name && (
                <p className="text-sm text-red-500">{errors.card_holder_name}</p>
              )}
            </div>

            {/* Validade e CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card_expiry_month">Mês</Label>
                <Select onValueChange={(value) => setValue('card_expiry_month', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_expiry_year">Ano</Label>
                <Select onValueChange={(value) => setValue('card_expiry_year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="AA" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString().slice(-2)}>
                        {year.toString().slice(-2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_cvv">CVV</Label>
                <Input
                  id="card_cvv"
                  placeholder="000"
                  value={formatCVV(data.card_cvv || '')}
                  onChange={(e) => setValue('card_cvv', e.target.value)}
                  maxLength={4}
                  className={errors.card_cvv ? 'border-red-500' : ''}
                />
              </div>
            </div>

            {/* Parcelamento para cartão de crédito */}
            {selectedMethod === 'credit_card' && (
              <div className="space-y-2">
                <Label htmlFor="installments">Parcelamento</Label>
                <Select onValueChange={(value) => setValue('installments', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o parcelamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Indicador de validação automática */}
          {isGeneratingToken && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Validando dados do cartão...
              </AlertDescription>
            </Alert>
          )}

          {cardToken && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                ✅ Dados do cartão validados e criptografados com segurança.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* CPF para todos os métodos */}
      <div className="space-y-2">
        <Label htmlFor="document_number">CPF</Label>
        <Input
          id="document_number"
          placeholder="000.000.000-00"
          value={formatCPF(data.document_number || '')}
          onChange={(e) => setValue('document_number', e.target.value.replace(/\D/g, ''))}
          maxLength={14}
          className={errors.document_number ? 'border-red-500' : ''}
        />
        {errors.document_number && (
          <p className="text-sm text-red-500">{errors.document_number}</p>
        )}
      </div>

      {/* Informações de segurança */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Seus dados estão protegidos com criptografia SSL de 256 bits. 
          Processamento seguro via Mercado Pago.
        </AlertDescription>
      </Alert>

      {/* Aviso para PIX */}
      {selectedMethod === 'pix' && (
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            Após revisar o pedido, você receberá o código PIX para pagamento instantâneo.
          </AlertDescription>
        </Alert>
      )}

      {/* Aviso para Cartão */}
      {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && cardToken && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Cartão validado com sucesso. Revise seu pedido para finalizar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentForm;
