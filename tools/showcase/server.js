// Nullfall - showcase capture server
// Serves www/ and saves recordings the page uploads (POST /__capture?name=…) into the capture folder.
//   node tools/showcase/server.js [--port 8790] [--out captures]

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const PORT = Number(process.env.PORT || arg('port', 8790));
const WWW = path.join(__dirname, '..', '..', 'www');
const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'captures')));

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'POST' && url.pathname === '/__capture') {
        const name = (url.searchParams.get('name') || `capture-${Date.now()}.webm`).replace(/[^\w.-]/g, '_');
        fs.mkdirSync(OUT, { recursive: true });
        const file = path.join(OUT, name);
        const ws = fs.createWriteStream(file);
        req.pipe(ws);
        ws.on('finish', () => {
            console.log(`saved ${file}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ file }));
        });
        return;
    }
    let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (!p) p = 'maingameplay.html';
    const file = path.join(WWW, p);
    if (!file.startsWith(WWW)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
    });
}).listen(PORT, () => console.log(`showcase server on http://localhost:${PORT} → ${OUT}`));
