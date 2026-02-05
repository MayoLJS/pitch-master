// Basic Service Worker
self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
    // Just a pass-through for now, can be expanded for caching
});
