import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  // ✅ Força verificação ao acessar rota privada
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        // Se não está autenticado, tenta verificar novamente
        if (!isAuthenticated) {
          await refreshUser();
        }
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [isLoading, isAuthenticated, refreshUser]);
  
  // Mostra loading enquanto verifica autenticação
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
