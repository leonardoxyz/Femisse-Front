import api from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

export interface UpdateProfileData {
  nome: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
}

export interface UserProfileData {
  nome: string;
  email: string;
  data_nascimento: string | null;
  cpf: string | null;
  telefone: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
}

export const updateUserProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  try {
    // Token enviado automaticamente via cookies httpOnly
    const response = await api.put(
      `${API_ENDPOINTS.users}/profile`,
      data
    );

    // ✅ Backend agora retorna { success, message, data }
    return response.data;
  } catch (error: any) {
    // Erro da API
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Erro de rede
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
    
    // Erro de autenticação (interceptor já redireciona)
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    // Outros erros HTTP
    if (error.response?.status) {
      throw new Error(`Erro ${error.response.status}: ${error.response.statusText || 'Erro desconhecido'}`);
    }
    
    // Erro não relacionado ao axios
    throw new Error('Erro inesperado. Tente novamente.');
  }
};
