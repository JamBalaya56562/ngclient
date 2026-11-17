import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const channel=process.argv[2]??'shell',count=Number(process.argv[3]??200),parallel=Number(process.argv[4]??1),records=[];
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><a id="go" href="/target">Open target</a>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(channel==='shell'?{}:{channel:'chromium'});
const cdp=await browser.newBrowserCDPSession();
let missing=0,confirmed=0,navigationFailures=0,completed=0;
try{
 await Promise.all(Array.from({length:parallel},async(_,worker)=>{
 for(let i=worker;i<count;i+=parallel){
  const context=await browser.newContext();const page=await context.newPage();let events=0;
  context.on('page',()=>events++);
  await context.route('**/target',r=>r.fulfill({contentType:'text/html',body:'<title>Popup target</title>'}));
  await page.goto(base);
  const session=await context.newCDPSession(page);const own=(await session.send('Target.getTargetInfo')).targetInfo;await session.detach();
  const before=new Set((await cdp.send('Target.getTargets')).targetInfos.map(t=>t.targetId));
  const pending=context.waitForEvent('page',{timeout:5000}).then(p=>({page:p}),e=>({error:e.message}));
  const start=Date.now();await page.locator('#go').click(i%2?{button:'middle'}:{modifiers:['ControlOrMeta']});
  const result=await pending;
  if(result.error){
   missing++;
   const targets=(await cdp.send('Target.getTargets')).targetInfos.filter(t=>!before.has(t.targetId)&&t.type==='page'&&t.browserContextId===own.browserContextId);
   const record={i,button:i%2?'middle':'modifier',elapsed:Date.now()-start,pages:context.pages().length,events,targets};
   if(missing===1){await new Promise(r=>setTimeout(r,25000));record.elapsed=Date.now()-start;record.eventsAfter30s=events;if(!events)confirmed++;}
   records.push(record);console.log(JSON.stringify({kind:'missing-page-event',...record}));
   for(const t of targets)await cdp.send('Target.closeTarget',{targetId:t.targetId});
  }else{
   try{await result.page.waitForURL('**/target',{timeout:5000});await result.page.waitForFunction(()=>document.title==='Popup target',undefined,{timeout:5000});}
   catch(error){navigationFailures++;const record={i,kind:'navigation-failure',url:result.page.url(),title:await result.page.title(),error:error.message};records.push(record);console.log(JSON.stringify(record));}
   await result.page.close();
  }
  await context.close();
  completed++;if(completed%25===0)console.log(JSON.stringify({kind:'progress',channel,completed,missing}));
 }
 }));
}finally{await browser.close();await new Promise(r=>server.close(r));}
await fs.writeFile('/out/probe-'+channel+'.json',JSON.stringify({channel,count,parallel,missing,navigationFailures,confirmedOver30Seconds:confirmed,records},null,2));
console.log(JSON.stringify({kind:'result',channel,count,parallel,missing,navigationFailures,confirmedOver30Seconds:confirmed}));
