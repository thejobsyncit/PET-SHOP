const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const DIAGRAMS_DIR = path.join(__dirname, '..', 'public', 'diagrams');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  let reqPath = req.url.split('?')[0];

  // Aliases for convenience
  if (reqPath === '/' || reqPath === '/crm' || reqPath === '/crm-flow') {
    reqPath = '/crm_flow_clear.html';
  } else if (reqPath === '/image' || reqPath === '/png') {
    reqPath = '/crm_flow_clear.png';
  } else if (reqPath === '/svg') {
    reqPath = '/crm_flow_clear.svg';
  }

  const filePath = path.join(DIAGRAMS_DIR, reqPath);

  // Prevent directory traversal
  if (!filePath.startsWith(DIAGRAMS_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<h2>404 - Diagram Not Found</h2><p><a href="/">Go to CRM Flow Diagram</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CRM Diagram Server] Running on http://localhost:${PORT}`);
  console.log(`[CRM Diagram Server] Direct Flow Diagram: http://localhost:${PORT}/crm_flow_clear.html`);
  console.log(`[CRM Diagram Server] Catalog: http://localhost:${PORT}/index.html`);
});
