// Serves a fake download that breaks partway through, to preview the browser's failed-download UI.
var TOTAL = 10 * 1024 * 1024;
var FAIL_AT = 2 * 1024 * 1024;

self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function(e){
  if (!new URL(e.request.url).pathname.endsWith('/descarga-rota.zip')) return;
  var sent = 0;
  var chunk = new Uint8Array(64 * 1024);
  var stream = new ReadableStream({
    pull: function(c){
      if (sent >= FAIL_AT){ c.error(new Error('Simulated network drop')); return; }
      return new Promise(function(r){ setTimeout(r, 100); }).then(function(){
        c.enqueue(chunk);
        sent += chunk.length;
      });
    }
  });
  e.respondWith(new Response(stream, { headers: {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="archivo-de-prueba.zip"',
    'Content-Length': String(TOTAL)
  }}));
});
