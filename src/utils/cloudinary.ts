/**
 * Helper para otimizacao de imagens via Cloudinary
 *
 * IMPORTANTE: Configure VITE_CLOUDINARY_CLOUD_NAME no .env
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dexhrrspb';

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale';
}

export const getCloudinaryUrl = (
  publicId: string,
  options: CloudinaryOptions = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (crop) transforms.push(`c_${crop}`);

  // Otimizacoes automaticas
  transforms.push('dpr_auto'); // Device Pixel Ratio automatico
  transforms.push('fl_progressive'); // Progressive JPEG
  transforms.push('fl_lossy'); // Compressao lossy para WebP

  const transformString = transforms.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
};

/**
 * Verifica se a URL e do Supabase Storage
 */
export const isSupabaseUrl = (url: string): boolean => {
  return url.includes('supabase.co/storage');
};

/**
 * Converte URL do Supabase para Cloudinary
 * Voce precisa fazer upload das imagens no Cloudinary primeiro
 */
export const convertToCloudinary = (
  supabaseUrl: string,
  options: CloudinaryOptions = {}
): string => {
  if (!isSupabaseUrl(supabaseUrl)) {
    return supabaseUrl;
  }

  // Extrair o nome do arquivo
  const fileName = supabaseUrl.split('/').pop() || '';
  const publicId = `feminisse/${fileName.split('.')[0]}`;

  return getCloudinaryUrl(publicId, options);
};
