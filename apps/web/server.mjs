import { createServer, request as proxyRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
createServer(async (req, res) => {
  if (req.url?.startsWith('/api/')) {
    const upstream = proxyRequest({ hostname: '127.0.0.1', port: 3001, path: req.url, method: req.method, headers: { ...req.headers, host: '127.0.0.1:3001' } }, response => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'API unavailable' })); });
    req.pipe(upstream);
    return;
  }
  const rawPath = req.url?.split('?')[0] ?? '/';
  const requested = rawPath === '/' ? '/index.html' : rawPath === '/management-risk-map' || rawPath === '/management-risk-map/' ? '/management-risk-map-web/index.html' : rawPath;
  const file = requested.startsWith('/management-risk-map-web/')
    ? normalize(join(root, '..', '..', requested.slice(1)))
    : normalize(join(root, requested));
  const allowedManagementPath = requested.startsWith('/management-risk-map-web/') && file.startsWith(normalize(join(root, '..', '..', 'management-risk-map-web')));
  if (!file.startsWith(root) && !allowedManagementPath) { res.writeHead(400); res.end('Bad path'); return; }
  try { let body = await readFile(file, 'utf8'); if (requested === '/review.html') body = body.replace('</body>', '<div id="amArea" class="result"></div><script src="/am-area.js"></script></body>'); if (requested === '/index.html') body = body.replace('</body>', '<script>document.getElementById("loginBtn")?.addEventListener("click",()=>setTimeout(()=>{if(document.getElementById("username")?.value.trim()==="management.demo"&&localStorage.getItem("geocredit.token")) location.href="/management-risk-map/"},500));</script></body>'); if (requested === '/management-risk-map-web/index.html') { body = body.replace('/management-risk-map-web/app.js', '/management-risk-map-web/app-v2.js').replace('/management-risk-map-web/styles.css', '/management-risk-map-web/styles-v2.css'); body = body.replace('</body>', '<script>setTimeout(()=>{const m=document.getElementById("map");if(m&&!m.querySelector("iframe")&&!m.querySelector("canvas")){m.innerHTML="<iframe title=\"OpenStreetMap\" src=\"https://www.openstreetmap.org/export/embed.html?bbox=88%2C20.5%2C92.8%2C26.8&layer=mapnik\"></iframe>"}},2500)</script></body>'); } res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.WEB_PORT ?? 3000), () => console.log('GeoCredit web listening on http://localhost:3000'));
