import api from './api';
import { API_BASE_URL } from '@/config/api';

export interface Testimonial {
  name: string;
  city: string;
  comment: string;
  rating: number;
  avatar: string;
  createdAt?: string;
}

export interface TestimonialAdmin extends Testimonial {
  id: string;
  isActive: boolean;
  updatedAt: string;
}

/**
 * Busca todos os depoimentos ativos (público - sem ID)
 */
type ApiListResponse<T> = {
  success: boolean;
  data: T;
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await api.get<ApiListResponse<Testimonial[]>>(
      `${API_BASE_URL}/api/testimonials`
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar testimonials:', error);
    return [];
  }
};

/**
 * Busca todos os depoimentos (admin - com ID)
 * Requer autenticação
 */
export const getTestimonialsAdmin = async (): Promise<TestimonialAdmin[]> => {
  try {
    const response = await api.get<ApiListResponse<TestimonialAdmin[]>>(
      `${API_BASE_URL}/api/testimonials/admin`,
      {
        requiresAuth: true,
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar testimonials (admin):', error);
    throw error;
  }
};

/**
 * Busca um depoimento específico por ID (admin)
 * Requer autenticação
 */
export const getTestimonialById = async (id: string): Promise<TestimonialAdmin> => {
  try {
    const response = await api.get<ApiListResponse<TestimonialAdmin>>(
      `${API_BASE_URL}/api/testimonials/${id}`,
      {
        requiresAuth: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar testimonial:', error);
    throw error;
  }
};

/**
 * Cria um novo depoimento
 * Requer autenticação
 */
export const createTestimonial = async (data: Omit<Testimonial, 'createdAt'>): Promise<TestimonialAdmin> => {
  try {
    const response = await api.post<ApiListResponse<TestimonialAdmin>>(
      `${API_BASE_URL}/api/testimonials`,
      {
        name: data.name,
        city: data.city,
        comment: data.comment,
        rating: data.rating,
        avatar_url: data.avatar,
      },
      {
        requiresAuth: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar testimonial:', error);
    throw error;
  }
};

/**
 * Atualiza um depoimento existente
 * Requer autenticação
 */
export const updateTestimonial = async (
  id: string,
  data: Omit<Testimonial, 'createdAt'>
): Promise<TestimonialAdmin> => {
  try {
    const response = await api.put<ApiListResponse<TestimonialAdmin>>(
      `${API_BASE_URL}/api/testimonials/${id}`,
      {
        name: data.name,
        city: data.city,
        comment: data.comment,
        rating: data.rating,
        avatar_url: data.avatar,
      },
      {
        requiresAuth: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar testimonial:', error);
    throw error;
  }
};

/**
 * Deleta um depoimento (soft delete)
 * Requer autenticação
 */
export const deleteTestimonial = async (id: string): Promise<void> => {
  try {
    await api.delete(`${API_BASE_URL}/api/testimonials/${id}`, { requiresAuth: true });
  } catch (error) {
    console.error('Erro ao deletar testimonial:', error);
    throw error;
  }
};

/**
 * Ativa/desativa um depoimento
 * Requer autenticação
 */
export const toggleTestimonial = async (id: string): Promise<TestimonialAdmin> => {
  try {
    const response = await api.patch<ApiListResponse<TestimonialAdmin>>(
      `${API_BASE_URL}/api/testimonials/${id}/toggle`,
      undefined,
      { requiresAuth: true }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao alternar testimonial:', error);
    throw error;
  }
};
