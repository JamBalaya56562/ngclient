import { chromium, request, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { randomUUID, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import { createWriteStream, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import net from 'node:net';
import assert from 'node:assert/strict';
const root=path.resolve('tmp/ngt087-counts-20261115');
const run=await fs.mkdtemp(path.join(root,'run-'));
const executable=process.env.NGT087_SERVER??(await fs.readFile('tmp/editor627-20261114/server-executable.txt','utf8')).trim();
const supported=process.env.NGT087_SUPPORTED==='true';
const password=randomUUID(),events=[],wire=[],jobs=new Set();
const record=(kind,data={})=>{events.push({kind,...data});console.log(JSON.stringify({kind,...data}));};
const port=async()=>{const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;};
const apiPort=await port(),uiPort=await port(),apiUrl=`http://127.0.0.1:${apiPort}`,uiUrl=`http://127.0.0.1:${uiPort}`;
const log=createWriteStream(path.join(run,'server.log'));
const server=spawn(executable,[`--server-datafolder=${path.join(run,'data')}`,'--allow-insecure-datafolder=true','--disable-db-encryption=true',`--webservice-port=${apiPort}`,'--webservice-interface=loopback',`--webservice-password=${password}`],{cwd:path.dirname(executable),env:{...process.env,DOTNET_ROOT:process.env.NGT087_DOTNET_ROOT??process.env.DOTNET_ROOT},windowsHide:true,stdio:['ignore','pipe','pipe']});
server.stdout.pipe(log,{end:false});server.stderr.pipe(log,{end:false});
let proxy,browser,api,page,currentCase='startup';const pageErrors=[];
const probe=await request.newContext({baseURL:apiUrl});
async function json(method,url,data){const r=await api[method](url,data===undefined?{}:{data});const text=await r.text();assert(r.ok(),`${r.status()} ${text}`);return text?JSON.parse(text):null;}
async function task(id,allowFailure=false){for(let i=0;i<240;i++){const s=await json('get',`/api/v1/task/${id}`);if(['Completed','Failed'].includes(s.Status)){if(!allowFailure)assert.equal(s.Status,'Completed',s.ErrorMessage);return s;}await new Promise(r=>setTimeout(r,500));}throw Error(`Task ${id} timed out`);}
try{
 let ready=false;for(let i=0;i<120;i++){if(server.exitCode!==null)throw Error('Server exited');const r=await probe.get('/api/v1/systeminfo',{timeout:1000}).catch(()=>null);if(r&&[200,401].includes(r.status())){ready=true;break;}await new Promise(r=>setTimeout(r,500));}assert(ready);
 const login=await probe.post('/api/v1/auth/login',{data:{Password:password,RememberMe:false}});assert(login.ok());const {AccessToken}=await login.json();
 api=await request.newContext({baseURL:apiUrl,extraHTTPHeaders:{Authorization:`Bearer ${AccessToken}`,'X-Ui-Language':'en-US'}});

 await json('patch','/api/v1/serversettings',{'shown-welcome-page-v1':'true','has-asked-for-password-change':'true'});
 const info=await json('get','/api/v1/systeminfo');record('server',{version:info.ServerVersion??info.Version,run});
 const source=process.env.NGT087_SOURCE?path.resolve(process.env.NGT087_SOURCE):path.join(run,'source'),remote=path.join(run,'remote');await fs.mkdir(remote);if(!process.env.NGT087_SOURCE){for(let d=0;d<20;d++)mkdirSync(path.join(source,String(d)),{recursive:true});for(let i=0;i<12000;i++)writeFileSync(path.join(source,String(i%20),`file-${i}.bin`),randomBytes(2048));}record('source-ready',{files:12000,bytes:12000*2048,source});
 const created=await json('post','/api/v1/backups',{Backup:{Name:'NGT-087 counts',TargetURL:pathToFileURL(remote).href,Sources:[source+path.sep],Settings:[{Name:'--no-encryption',Value:'true'},{Name:'--snapshot-policy',Value:'off'},{Name:'--throttle-upload',Value:'2mb'}],Filters:[],Tags:[],Metadata:{}},Schedule:null});const id=created.ID;jobs.add(id);
 proxy=spawn(process.execPath,['tmp/editor627-20261114/proxy.mjs',String(apiPort),String(uiPort),'dist/ngclient/browser'],{windowsHide:true,stdio:['ignore','pipe','pipe']});await Promise.race([once(proxy.stdout,'data'),once(proxy,'exit').then(()=>{throw Error('Proxy exited')})]);
 browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:'en-US',viewport:{width:1450,height:1100}});page=await context.newPage();const progress=[];
 function observe(p,locale){p.on('response',async r=>{if(new URL(r.url()).pathname.endsWith('/progressstate')){try{progress.push({locale,...await r.json()});}catch{}}});p.on('pageerror',e=>pageErrors.push({locale,message:e.message}));p.on('websocket',ws=>ws.on('framereceived',({payload})=>{try{const event=JSON.parse(String(payload));if(event.Type==='progress'){progress.push({locale,...event.Data});}}catch{}}));}
 observe(page,'en-US');await page.goto(uiUrl+'/login');await page.getByPlaceholder('Enter your password').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();await expect(page.locator('app-home')).toBeVisible({timeout:30000});
 const deContext=await browser.newContext({locale:'de-DE',viewport:{width:1450,height:1100}});await deContext.addInitScript(()=>localStorage.setItem('v1:duplicati:locale','de'));const de=await deContext.newPage();observe(de,'de');await de.goto(uiUrl+'/login');await de.locator('app-login input[type=password]').fill(password);await de.locator('app-login button[type=submit]').click();await expect(de.locator('app-home')).toBeVisible({timeout:30000});
 const started=await json('post',`/api/v1/backup/${id}/start`,{});record('backup-started',{taskId:started.ID});
 const captures={};
 for(let i=0;i<240;i++){
  for(const [locale,p] of [['en-US',page],['de',de]]){
   if(captures[locale])continue;const text=await p.locator('app-status-bar app-backup-progress .progress-section').innerText().catch(()=>'');
   for(const frame of progress.filter(f=>f.locale===locale).slice(-30).reverse()){
    const count=frame.StillCounting?frame.TotalFileCount:Math.max(0,frame.TotalFileCount-frame.ProcessedFileCount);if(!Number.isFinite(count)||count<1000)continue;
    const formatted=new Intl.NumberFormat(locale).format(count);if(text.includes(`${formatted} files`)){
     captures[locale]={count,formatted,text,phase:frame.Phase,stillCounting:frame.StillCounting,total:frame.TotalFileCount,processed:frame.ProcessedFileCount};await p.screenshot({path:path.join(run,locale+'.png')});record('locale-captured',{locale,...captures[locale]});break;
    }
   }
  }
  if(captures['en-US']&&captures.de)break;await new Promise(r=>setTimeout(r,250));
 }
 assert(captures['en-US'],'English grouping was not captured');assert(captures.de,'German grouping was not captured');
 const finished=await task(started.ID);const rows=await json('get',`/api/v1/backup/${id}/log`);const results=rows.filter(r=>r.Type==='Result').map(r=>JSON.parse(r.Message));assert(results.length);for(const r of results){assert.equal((r.Errors??[]).length,0);assert.equal((r.Warnings??[]).length,0);}
 const versions=await json('post','/api/v2/backup/list-filesets',{BackupId:id});assert(versions.Success);assert.equal(versions.Data.length,1);assert.deepEqual(pageErrors,[]);wire.push(...progress);record('completed',{finished,versions:versions.Data,captures,pageErrors});

}catch(e){record('failed',{error:e.stack});if(page){await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(run,'failure.txt'),await page.locator('body').innerText()).catch(()=>{});}process.exitCode=1;
}finally{
 if(api){for(const entry of await json('get','/api/v1/backups'))jobs.add(entry.Backup.ID);for(const id of jobs){try{const d=await api.delete(`/api/v1/backup/${id}`,{params:{'delete-local-db':'true','delete-remote-files':'false'}});assert(d.ok());const r=await d.json();if(r.ID)await task(r.ID);}catch(e){record('cleanup-failed',{message:e.message});process.exitCode=1;}}record('cleanup',{remainingJobs:(await json('get','/api/v1/backups')).length});}
 await browser?.close();await api?.dispose();await probe.dispose();for(const child of [proxy,server])if(child?.pid&&child.exitCode===null&&child.signalCode===null){const closed=once(child,'close');child.kill();await closed;}await new Promise(r=>log.end(r));
 await fs.writeFile(path.join(run,'events.json'),JSON.stringify(events,null,2));await fs.writeFile(path.join(run,'wire.json'),JSON.stringify(wire,null,2));await fs.writeFile(path.join(root,'latest-run.txt'),run);
}
