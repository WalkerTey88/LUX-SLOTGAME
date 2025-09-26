const CACHE_NAME = 'lyx-order-v1.15f';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&family=Noto+Serif+SC:wght@400;700&display=swap'
];

// 安装 Service Worker 并缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存资源:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('缓存失败:', error);
            })
    );
    self.skipWaiting(); // 立即激活新 Service Worker
});

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('清除旧缓存:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // 立即接管控制
});

// 拦截请求并提供缓存或网络响应
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中存在，直接返回
                if (response) {
                    return response;
                }
                // 否则尝试从网络获取，并缓存新资源
                return fetch(event.request)
                    .then((networkResponse) => {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, clonedResponse);
                            });
                        return networkResponse;
                    })
                    .catch(() => {
                        // 离线时返回缓存的 index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('离线模式，无缓存资源', { status: 503 });
                    });
            })
    );
});