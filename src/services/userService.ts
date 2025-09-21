import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

export interface UpdateProfileData {
  nome: string;
  data_nascimento: string;
  cpf: string;
  telefone: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    nome: string;
    data_nascimento: string;
    cpf: string;
    telefone: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

export const updateUserProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await axios.put(
      API_ENDPOINTS.userProfile,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Erro da API
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      // Erro de rede ou outros
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      
      // Erro de autenticação
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      // Outros erros HTTP
      throw new Error(`Erro ${error.response?.status}: ${error.response?.statusText || 'Erro desconhecido'}`);
    }
    
    // Erro não relacionado ao axios
    throw new Error('Erro inesperado. Tente novamente.');
  }
};
