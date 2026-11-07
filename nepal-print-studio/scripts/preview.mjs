import http from 'node:http';import {readFileSync} from 'node:fs';
http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync('worker/ui.html'))}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
