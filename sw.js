const CACHE_NAME = 'dan-search-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/favicon.ico'
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache).catch(() => {
                    // キャッシュに失敗してもスキップ
                });
            })
    );
    self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // APIリクエストはキャッシュしない
    if (request.url.includes('find-joy-feed.lovable.app')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response('API access failed', { status: 503 });
                })
        );
        return;
    }

    // 通常のリクエストはキャッシュを使用
    event.respondWith(
        caches.match(request)
            .then((response) => {
                return response || fetch(request)
                    .then((fetchResponse) => {
                        // 成功したリクエストをキャッシュに追加
                        if (fetchResponse && fetchResponse.status === 200) {
                            const responseToCache = fetchResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return fetchResponse;
                    })
                    .catch(() => {
                        // オフラインの場合はキャッシュを返す
                        return caches.match(request) || 
                               new Response('Offline', { status: 503 });
                    });
            })
    );
});
