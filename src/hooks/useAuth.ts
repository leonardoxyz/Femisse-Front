// ⚠️ IMPORTANTE: Tokens sensíveis não ficam em localStorage
// Cookies httpOnly são a fonte primária; fallback usa armazenamento seguro em memória/session

export { useAuth, getToken, getUserFromToken } from '@/contexts/AuthContext';
export { tokenStorage } from '@/utils/tokenStorage';
