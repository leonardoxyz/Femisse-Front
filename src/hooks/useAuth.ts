import { useCallback } from 'react';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    // JWT: header.payload.signature
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    // Verifica se o token expirou
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    
    return decoded;
  } catch {
    // Se houver erro ao decodificar, remove o token inválido
    localStorage.removeItem('token');
    return null;
  }
}

export function useAuth() {
  const token = getToken();
  const user = getUserFromToken();
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  return { user, token, isAuthenticated, logout };
}
