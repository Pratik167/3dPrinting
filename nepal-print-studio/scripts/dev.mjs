import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { bucket, root, adminToken } from './local-storage.mjs';

if (Number(process.versions.node.split('.')[0]) < 22) throw Error('Install Node.js 22 or newer to run Layer Studio.');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT must be between 1 and 65535.');
const origin = 'http://127.0.0.1:' + port;
const env = { BUCKET: bucket, ADMIN_TOKEN: process.env.ADMIN_TOKEN || await adminToken() };
let previousSource = '', worker;
async function currentWorker() {
  const [html, server] = await Promise.all(['ui.html', 'server.js'].map(name => readFile(path.join(root, 'worker', name), 'utf8')));
  const source = 'const page=' + JSON.stringify(html) + ';\n' + server;
  if (source !== previousSource) {
    worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
    previousSource = source;
  }
  return worker;
}
await currentWorker();
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const chunks = []; let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 11 * 1024 * 1024) { outgoing.writeHead(413); outgoing.end('Request must be under 11 MB.'); return; }
      chunks.push(chunk);
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    headers.set('CF-Connecting-IP', incoming.socket.remoteAddress || 'local');
    const method = incoming.method || 'GET';
    const request = new Request(origin + (incoming.url || '/'), { method, headers, ...(!['GET', 'HEAD'].includes(method) ? { body: Buffer.concat(chunks) } : {}) });
    const response = await (await currentWorker()).fetch(request, env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Local request failed:', error.message);
    if (!outgoing.headersSent) outgoing.writeHead(500, { 'Content-Type': 'application/json' });
    outgoing.end(JSON.stringify({ error: 'Local server error. Check the terminal.' }));
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Stop the other server or set PORT to another port.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`\nLayer Studio running at ${origin}\nSave a source file and refresh your browser to see changes.\nLocal data: .local/storage (separate from the hosted website).\nAdmin token: run npm run admin:token in another terminal.\nPress Ctrl+C to stop.\n`);
  if (process.argv.includes('--open')) {
    const opener = process.platform === 'win32' ? 'explorer.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    const child = spawn(opener, [origin], { stdio: 'ignore', detached: true });
    child.on('error', () => console.log('Open this URL in your browser: ' + origin));
    child.unref();
  }
});
