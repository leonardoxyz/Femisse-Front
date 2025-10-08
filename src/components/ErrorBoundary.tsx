import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * Error Boundary para capturar erros em toda a aplicação
 * Previne crash completo e oferece recuperação graceful
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log do erro
    logger.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Em produção, enviar para serviço de monitoramento
    if (!import.meta.env.DEV) {
      // TODO: Integrar com Sentry ou similar
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900">
              Ops! Algo deu errado
            </h1>

            <p className="mb-6 text-center text-zinc-600">
              Encontramos um erro inesperado. Não se preocupe, você pode tentar novamente.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4">
                <p className="mb-2 text-sm font-semibold text-red-800">
                  Detalhes do erro (apenas em desenvolvimento):
                </p>
                <pre className="overflow-auto text-xs text-red-700">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleReset}
                className="w-full bg-[#58090d] hover:bg-[#58090d]/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar Página
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                Voltar para Home
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Se o problema persistir, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
