self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Un Service Worker mínimo requerido por navegadores para activar el prompt de instalación PWA.
  // No cachea nada, siempre va a la red.
});
