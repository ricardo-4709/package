const CACHE_NAME = 'LVlist-v3.2';
const ASSETS = [
  './',
  './code-pkg.html',
  './manifest.json',
  './Generated_Image.png'
];

// 安裝階段：強制快取核心靜態資源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 啟用階段：自動清理舊版本的快取快照
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求策略：Stale-While-Revalidate (既能秒開離線使用，又能背景自動下載新版)
self.addEventListener('fetch', (e) => {
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(e.request).then((cachedResponse) => {
          
          const fetchPromise = fetch(e.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return cachedResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});