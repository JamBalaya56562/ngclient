import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs/promises';
import path from 'node:path';
const [api, ui] = process.argv.slice(2).map(Number);
const candidate=path.resolve(process.argv[4] ?? 'dist/ngclient/browser');
const baseline=candidate;
let root=candidate;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/__variant'&&req.method==='POST'){root=url.searchParams.get('value')==='baseline'?baseline:candidate;res.end(root);return;}
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/notifications')){
   const upstream=http.request({hostname:'127.0.0.1',port:api,path:req.url,method:req.method,headers:{...req.headers,host:('127.0.0.1:'+api)}},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
   upstream.on('error',e=>{res.writeHead(502);res.end(e.message)});req.pipe(upstream);return;
 }
 try{let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 if(!path.extname(file))file=path.join(root,'index.html');const data=await fs.readFile(file);res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch{res.writeHead(404);res.end();}
});
server.on('upgrade',(req,socket,head)=>{const upstream=net.connect(api,'127.0.0.1',()=>{upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n`+Object.entries({...req.headers,host:('127.0.0.1:'+api)}).map(([k,v])=>`${k}: ${v}\r\n`).join('')+'\r\n');upstream.write(head);socket.pipe(upstream);upstream.pipe(socket)});upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy());});
server.listen(ui,'127.0.0.1',()=>console.log('Restore verification proxy ready'));







