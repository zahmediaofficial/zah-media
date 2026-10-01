import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(project, 'dist');
const useReferences = !process.argv.includes('--originals-only');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname).replace(/^\/zah-media(?=\/)/, '');
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let bytes = await readFile(file);
    if (useReferences && file === path.join(root, 'content', 'graduation.json')) {
      const config = JSON.parse(bytes);
      const preview = JSON.parse(await readFile(path.join(project, 'dev', 'graduation-preview.json')));
      for (const [key, image] of Object.entries(preview.images)) config.images[key] = { ...config.images[key], ...image };
      bytes = Buffer.from(JSON.stringify(config));
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4193, '127.0.0.1', () => console.log('Graduation draft: http://127.0.0.1:4193/zah-media/graduation/ (' + (useReferences ? 'development reference photographs' : 'original photographs only') + ')'));
