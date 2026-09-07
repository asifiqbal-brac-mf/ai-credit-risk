import { createServer, request as proxyRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
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
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) { res.writeHead(400); res.end('Bad path'); return; }
  try { const body = await readFile(file); res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.WEB_PORT ?? 3000), () => console.log('GeoCredit web listening on http://localhost:3000'));
