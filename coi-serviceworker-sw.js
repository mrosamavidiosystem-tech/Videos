self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{
   if(!r||r.type==="opaque")return r;
   const h=new Headers(r.headers);
   h.set("Cross-Origin-Opener-Policy","same-origin");
   h.set("Cross-Origin-Embedder-Policy","require-corp");
   if(u.pathname.endsWith(".wasm"))h.set("Content-Type","application/wasm");
   return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});
 }));
});