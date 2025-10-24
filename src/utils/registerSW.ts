import logger from "./logger-unified";

/**
 * Registra Service Worker para PWA
 * Apenas em produção
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.log('Service Worker registrado:', registration.scope);

          // Verifica atualizações a cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          logger.error('Erro ao registrar Service Worker:', error);
        });
    });
  }
}

/**
 * Desregistra Service Worker
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    logger.log('Service Worker desregistrado');
  }
}
