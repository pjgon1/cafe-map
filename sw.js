// 앱 화면만 캐시해서 홈 화면 앱처럼 열리게 함 (지도·검색은 항상 인터넷 사용)
const C='cafe-map-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  // ?s=, ?v= 같은 주소 꼬리는 빼고 한 칸에만 저장 (캐시가 계속 불어나지 않게)
  const key=e.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:u.origin+u.pathname;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(key,cp));}return r;}).catch(()=>caches.match(key).then(m=>m||caches.match(e.request))));
});
