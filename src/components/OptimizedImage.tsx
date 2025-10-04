import React, { useState, useCallback } from 'react';
import { optimizeImageUrl, createIntersectionObserver } from '@/utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  className?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'webp',
  className = '',
  loading = 'lazy',
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');

  // Ref para o elemento img
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node || loading === 'eager') return;

    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [loading]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Otimizar URL da imagem
  const optimizedSrc = optimizeImageUrl(src, {
    width,
    height,
    quality,
    format
  });

  // Placeholder enquanto carrega
  const showPlaceholder = !isLoaded && !hasError && isInView;
  const showImage = isInView && !hasError;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {showPlaceholder && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt="" 
              className="w-full h-full object-cover opacity-50"
              aria-hidden="true"
            />
          ) : (
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Imagem otimizada */}
      {showImage && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          decoding="async"
        />
      )}

      {/* Estado de erro */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs">Erro ao carregar</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para preload de imagens críticas
export function useImagePreload(src: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  React.useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsPreloaded(true);
    img.onerror = () => setIsPreloaded(false);
    img.src = src;
  }, [src]);

  return isPreloaded;
}

export default OptimizedImage;
