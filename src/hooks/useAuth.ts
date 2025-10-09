// ⚠️ IMPORTANTE: Não usamos localStorage por segurança
// O token está armazenado em cookies httpOnly (backend)

// Re-exporta do AuthContext para manter compatibilidade
export { useAuth, getToken, getUserFromToken } from '@/contexts/AuthContext';
