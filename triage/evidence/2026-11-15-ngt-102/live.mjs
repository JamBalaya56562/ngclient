import { chromium, request, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import net from 'node:net';
import assert from 'node:assert/strict';
const root=path.resolve('tmp/ngt102-warning-job-type-20261115');
const run=await fs.mkdtemp(path.join(root,'run-'));
const executable=process.env.NGT102_SERVER??(await fs.readFile('tmp/editor627-20261114/server-executable.txt','utf8')).trim();
const supported=process.env.NGT102_SUPPORTED==='true';
const password=randomUUID(),events=[],wire=[],jobs=new Set();
const record=(kind,data={})=>{events.push({kind,...data});console.log(JSON.stringify({kind,...data}));};
const port=async()=>{const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;};
const apiPort=await port(),uiPort=await port(),apiUrl=`http://127.0.0.1:${apiPort}`,uiUrl=`http://127.0.0.1:${uiPort}`;
const log=createWriteStream(path.join(run,'server.log'));
const server=spawn(executable,[`--server-datafolder=${path.join(run,'data')}`,'--allow-insecure-datafolder=true','--disable-db-encryption=true',`--webservice-port=${apiPort}`,'--webservice-interface=loopback',`--webservice-password=${password}`],{cwd:path.dirname(executable),env:{...process.env,DOTNET_ROOT:process.env.NGT102_DOTNET_ROOT??process.env.DOTNET_ROOT},windowsHide:true,stdio:['ignore','pipe','pipe']});
server.stdout.pipe(log,{end:false});server.stderr.pipe(log,{end:false});
let proxy,browser,api,page,currentCase='startup';const pageErrors=[];
const probe=await request.newContext({baseURL:apiUrl});
async function json(method,url,data){const r=await api[method](url,data===undefined?{}:{data});const text=await r.text();assert(r.ok(),`${r.status()} ${text}`);return text?JSON.parse(text):null;}
async function task(id,allowFailure=false){for(let i=0;i<240;i++){const s=await json('get',`/api/v1/task/${id}`);if(['Completed','Failed'].includes(s.Status)){if(!allowFailure)assert.equal(s.Status,'Completed',s.ErrorMessage);return s;}await new Promise(r=>setTimeout(r,500));}throw Error(`Task ${id} timed out`);}
try{
 let ready=false;for(let i=0;i<120;i++){if(server.exitCode!==null)throw Error('Server exited');const r=await probe.get('/api/v1/systeminfo',{timeout:1000}).catch(()=>null);if(r&&[200,401].includes(r.status())){ready=true;break;}await new Promise(r=>setTimeout(r,500));}assert(ready);
 const login=await probe.post('/api/v1/auth/login',{data:{Password:password,RememberMe:false}});assert(login.ok());const {AccessToken}=await login.json();
 api=await request.newContext({baseURL:apiUrl,extraHTTPHeaders:{Authorization:`Bearer ${AccessToken}`,'X-Ui-Language':'en-US'}});

 await json('patch','/api/v1/serversettings',{'shown-welcome-page-v1':'true','has-asked-for-password-change':'true'});const info=await json('get','/api/v1/systeminfo');record('server',{version:info.ServerVersion??info.Version,run});
 const source=path.join(run,'source'),remote=path.join(run,'remote');await fs.mkdir(source);await fs.mkdir(remote);const file=path.join(source,'report.txt');await fs.writeFile(file,'before warning suppression');
 const definition={Name:'NGT102 Sync',OperationType:'Sync',Enabled:true,TargetURL:pathToFileURL(remote).href,Sources:[source+path.sep],Settings:[{Name:'--no-encryption',Value:'true'},{Name:'--snapshot-policy',Value:'off'},{Name:'--ngt102-warning-probe',Value:'true'}],Filters:[],Tags:[],Metadata:{}};
 const created=await json('post','/api/v1/backups',{Backup:definition,Schedule:null});const id=created.ID;jobs.add(id);
 const controlRemote=path.join(run,'control-remote');await fs.mkdir(controlRemote);const control=await json('post','/api/v1/backups',{Backup:{...definition,Name:'NGT102 old-body control',TargetURL:pathToFileURL(controlRemote).href},Schedule:null});jobs.add(control.ID);
 const controlBefore=await json('get',`/api/v1/backup/${control.ID}`);assert.equal(controlBefore.Backup.OperationType,'Sync');const {OperationType,...withoutType}=definition;await json('put',`/api/v1/backup/${control.ID}`,{Backup:{...withoutType,Name:'NGT102 old-body control',TargetURL:pathToFileURL(controlRemote).href},Schedule:null});const controlAfter=await json('get',`/api/v1/backup/${control.ID}`);assert.equal(controlAfter.Backup.OperationType,'Backup');record('old-server-omission-control',{before:'Sync',after:controlAfter.Backup.OperationType});
 const start=await json('post',`/api/v1/backup/${id}/start`,{});await task(start.ID);const logs=await json('get',`/api/v1/backup/${id}/log`);const result=logs.filter(r=>r.Type==='Result').map(r=>JSON.parse(r.Message)).find(r=>r.MainOperation==='Sync');assert(result);assert(result.Warnings.some(w=>w.includes('UnsupportedOption')));assert.equal((result.Errors??[]).length,0);record('real-warning',{operation:result.MainOperation,warnings:result.Warnings});
 await json('post',`/api/v1/backup/${id}/disable`,{});
 proxy=spawn(process.execPath,['tmp/editor627-20261114/proxy.mjs',String(apiPort),String(uiPort),'dist/ngclient/browser'],{windowsHide:true,stdio:['ignore','pipe','pipe']});await Promise.race([once(proxy.stdout,'data'),once(proxy,'exit').then(()=>{throw Error('Proxy exited')})]);browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:'en-US',viewport:{width:1450,height:1200}});page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(uiUrl+'/login');await page.getByPlaceholder('Enter your password').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();const card=page.locator('app-home .backup').filter({hasText:'NGT102 Sync'});await expect(card).toBeVisible({timeout:30000});await card.getByRole('button',{name:'More actions',exact:true}).click();await page.getByRole('button',{name:'Log',exact:true}).click();
 const entry=page.locator('app-general-log article.log-entry').first();await expect(entry).toBeVisible({timeout:30000});await entry.locator('header').click();const summary=entry.locator('summary').filter({hasText:'Warnings'});if(!await summary.evaluate(e=>e.closest('details').open))await summary.click();await entry.locator('.log-line-row').filter({hasText:'UnsupportedOption'}).first().click();
 for(const action of ['Suppress','Un-suppress']){
  const requested=page.waitForRequest(r=>r.method()==='PUT'&&r.url().endsWith(`/api/v1/backup/${id}`));const response=page.waitForResponse(r=>r.request().method()==='PUT'&&r.url().endsWith(`/api/v1/backup/${id}`));await page.getByRole('button',{name:new RegExp('^'+action)}).click();const payload=(await requested).postDataJSON();assert.equal(payload.Backup.OperationType,'Sync');assert.equal(payload.Backup.Enabled,false);assert((await response).ok());const saved=await json('get',`/api/v1/backup/${id}`);assert.equal(saved.Backup.OperationType,'Sync');assert.equal(saved.Backup.Enabled,false);const suppressed=saved.Backup.Settings.find(s=>s.Name==='--suppress-warnings')?.Value;assert.equal(!!suppressed,action==='Suppress');await expect(page.getByRole('button',{name:new RegExp('^'+(action==='Suppress'?'Un-suppress':'Suppress'))})).toBeVisible();wire.push({action,request:payload,saved:{OperationType:saved.Backup.OperationType,Enabled:saved.Backup.Enabled,suppressed}});await page.screenshot({path:path.join(run,action+'.png')});record('action-passed',{action,OperationType:saved.Backup.OperationType,Enabled:saved.Backup.Enabled,suppressed});
 }
 await json('post',`/api/v1/backup/${id}/enable`,{});const contents='after suppression and unsuppression: still Sync';await fs.writeFile(file,contents);const again=await json('post',`/api/v1/backup/${id}/start`,{});await task(again.ID);assert.equal(await fs.readFile(path.join(remote,'report.txt'),'utf8'),contents);const last=await json('get',`/api/v1/backup/${id}`);assert.equal(last.Backup.OperationType,'Sync');assert.equal(last.Backup.Enabled,true);assert(!(await fs.readdir(remote)).some(n=>/\.d(block|index|list)\./.test(n)));assert.deepEqual(pageErrors,[]);record('completed',{rerunOperationType:last.Backup.OperationType,plainFileMatches:true,pageErrors});

}catch(e){record('failed',{error:e.stack});if(page){await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(run,'failure.txt'),await page.locator('body').innerText()).catch(()=>{});}process.exitCode=1;
}finally{
 if(api){for(const entry of await json('get','/api/v1/backups'))jobs.add(entry.Backup.ID);for(const id of jobs){try{const d=await api.delete(`/api/v1/backup/${id}`,{params:{'delete-local-db':'true','delete-remote-files':'false'}});assert(d.ok());const r=await d.json();if(r.ID)await task(r.ID);}catch(e){record('cleanup-failed',{message:e.message});process.exitCode=1;}}record('cleanup',{remainingJobs:(await json('get','/api/v1/backups')).length});}
 await browser?.close();await api?.dispose();await probe.dispose();for(const child of [proxy,server])if(child?.pid&&child.exitCode===null&&child.signalCode===null){const closed=once(child,'close');child.kill();await closed;}await new Promise(r=>log.end(r));
 await fs.writeFile(path.join(run,'events.json'),JSON.stringify(events,null,2));await fs.writeFile(path.join(run,'wire.json'),JSON.stringify(wire,null,2));await fs.writeFile(path.join(root,'latest-run.txt'),run);
}
