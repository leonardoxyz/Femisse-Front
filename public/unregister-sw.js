if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker desregistrado');
    }
  });
  
  // Limpar todos os caches
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('🗑️ Deletando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}
