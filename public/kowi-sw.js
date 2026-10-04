// Public offline notice only. Never cache API, private pages, tokens or conversations.
const CACHE='kowi-public-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.open(CACHE).then(cache=>cache.match('/offline.html')).then(response=>response||new Response('KOWI necesita conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
