import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.join(import.meta.dirname,'dist');
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,`.${pathname==='/'?'/index.html':pathname}`);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}const body=await fs.readFile(file);res.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.json')?'application/json':'text/html'});res.end(body)}catch{res.writeHead(404);res.end('Not found')}});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
