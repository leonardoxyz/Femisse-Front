import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { tokenStorage } from '@/utils/tokenStorage';
import { logger } from '../utils/logger-unified';

interface User {
  id: string;
  nome: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggingOutRef = React.useRef(false); // ✅ Flag para prevenir re-autenticação

  const refreshUser = useCallback(async () => {
    // ✅ Não atualiza se estiver fazendo logout
    if (isLoggingOutRef.current) {
      return false;
    }
    
    try {
      logger.log('🔄 refreshUser: chamando API...');
      const response = await api.get(`${API_ENDPOINTS.users}/profile`);
      logger.log('📦 refreshUser: resposta recebida:', response.data);
      
      const userData = response.data?.data;
      logger.log('👤 refreshUser: userData extraído:', userData);
      
      if (userData && (userData.nome || userData.email)) {
        logger.log('✅ refreshUser: usuário válido, autenticando...');
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        logger.error('❌ refreshUser: userData inválido');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      logger.error('❌ refreshUser: erro na API:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Verifica autenticação apenas uma vez ao montar
  useEffect(() => {
    const checkAuth = async () => {
      // ✅ Não verifica se estiver fazendo logout
      if (isLoggingOutRef.current) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`${API_ENDPOINTS.users}/profile`);
        // ✅ CRÍTICO: Backend retorna { success, data: { user } }
        const userData = response.data?.data;
        
        if (userData && (userData.nome || userData.email)) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        logger.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // ✅ Executa apenas uma vez

  const logout = useCallback(async () => {
    // ✅ Marca que está fazendo logout
    isLoggingOutRef.current = true;
    
    try {
      await api.post(`${API_ENDPOINTS.auth}/logout`);
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
    } finally {
      // ✅ Limpa estado imediatamente
      setUser(null);
      setIsAuthenticated(false);
      
      // ✅ Limpa fallback de tokens com TTL curto
      tokenStorage.clearTokens();
      
      // ✅ Redireciona de forma síncrona
      window.location.href = '/login';
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      logout,
      refreshUser,
    }),
    [user, isAuthenticated, isLoading, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Funções legadas para compatibilidade
export function getToken() {
  return tokenStorage.getAccessToken();
}

export function getUserFromToken() {
  return null;
}
