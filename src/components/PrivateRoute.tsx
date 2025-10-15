import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // ✅ Mostra loading apenas enquanto o AuthContext está verificando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58090d] mx-auto"></div>
          <p className="text-sm text-zinc-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // ✅ Se não está autenticado E não está mais carregando, redireciona
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // ✅ Se está autenticado, renderiza a rota protegida
  return <>{children}</>;
}
