import React, { useRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onExpire,
  className = ''
}) => {
  const turnstileRef = useRef<TurnstileInstance>(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  
  // Detecta o ambiente atual
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Log para debug (apenas em desenvolvimento)
  if (isDevelopment) {
    console.log('Turnstile Environment:', {
      isDevelopment,
      isProduction,
      siteKey: siteKey ? 'Configured' : 'Missing',
      mode: import.meta.env.MODE
    });
  }

  if (!siteKey) {
    console.error('VITE_TURNSTILE_SITE_KEY não configurado');
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${className}`}>
        ⚠️ Configuração do Turnstile não encontrada
      </div>
    );
  }

  const handleVerify = (token: string) => {
    if (isDevelopment) {
      console.log('Turnstile verification successful:', token.substring(0, 20) + '...');
    }
    onVerify(token);
  };

  const handleError = () => {
    console.error('Turnstile verification failed');
    onError?.();
  };

  const handleExpire = () => {
    if (isDevelopment) {
      console.log('Turnstile token expired');
    }
    onExpire?.();
  };

  // Método para resetar o widget
  const reset = () => {
    turnstileRef.current?.reset();
  };

  return (
    <div className={`turnstile-container ${className}`}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme: 'light',
          size: 'normal',
          language: 'pt-BR',
          ...(isDevelopment && {
            'data-callback': 'turnstileCallback',
            'data-error-callback': 'turnstileError'
          })
        }}
      />
    </div>
  );
};

// Exporta também uma função para resetar externamente
export const resetTurnstile = (ref: React.RefObject<TurnstileInstance>) => {
  ref.current?.reset();
};

export default TurnstileWidget;
