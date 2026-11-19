// 앱 화면만 캐시해서 홈 화면 앱처럼 열리게 함 (지도·검색은 항상 인터넷 사용)
const C='cafe-map-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
const put=(k,r)=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(k,cp));}return r;};
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin){
    // 버전이 고정된 로그인 라이브러리·글꼴은 한 번 받으면 폰에 두고 바로 씀
    if(/^cdn\.jsdelivr\.net$/.test(u.host)&&/@\d+\.\d+\.\d+\//.test(u.pathname)||u.host==='fonts.gstatic.com')
      e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>put(e.request,r))));
    return;
  }
  // ?s=, ?v= 같은 주소 꼬리는 빼고 한 칸에만 저장 (캐시가 계속 불어나지 않게)
  const key=e.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:u.origin+u.pathname;
  // 앱 화면(index)은 폰에 남은 옛 사본을 건너뛰고 늘 서버에서 새로 받음
  const req=e.request.mode==='navigate'?fetch(u.href,{cache:'no-store'}):fetch(e.request);
  e.respondWith(req.then(r=>put(key,r)).catch(()=>caches.match(key).then(m=>m||caches.match(e.request))));
});
