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
const root=path.resolve('tmp/ngt086-skip-20261115');
const run=await fs.mkdtemp(path.join(root,'run-'));
const executable=process.env.NGT086_SERVER??(await fs.readFile('tmp/editor627-20261114/server-executable.txt','utf8')).trim();
const supported=process.env.NGT086_SUPPORTED==='true';
const password=randomUUID(),events=[],wire=[],jobs=new Set();
const record=(kind,data={})=>{events.push({kind,...data});console.log(JSON.stringify({kind,...data}));};
const port=async()=>{const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;};
const apiPort=await port(),uiPort=await port(),apiUrl=`http://127.0.0.1:${apiPort}`,uiUrl=`http://127.0.0.1:${uiPort}`;
const log=createWriteStream(path.join(run,'server.log'));
const args=[`--server-datafolder=${path.join(run,'data')}`,'--allow-insecure-datafolder=true','--disable-db-encryption=true',`--webservice-port=${apiPort}`,'--webservice-interface=loopback',`--webservice-password=${password}`];
function launch(){const s=spawn(executable,args,{cwd:path.dirname(executable),env:{...process.env,DOTNET_ROOT:process.env.NGT086_DOTNET_ROOT??process.env.DOTNET_ROOT},windowsHide:true,stdio:['ignore','pipe','pipe']});s.stdout.pipe(log,{end:false});s.stderr.pipe(log,{end:false});return s;}
let server=launch();
let proxy,browser,api,page,currentCase='startup';const pageErrors=[];
const probe=await request.newContext({baseURL:apiUrl});
async function json(method,url,data){const r=await api[method](url,data===undefined?{}:{data});const text=await r.text();assert(r.ok(),`${r.status()} ${text}`);return text?JSON.parse(text):null;}
async function task(id,allowFailure=false){for(let i=0;i<240;i++){const s=await json('get',`/api/v1/task/${id}`);if(['Completed','Failed'].includes(s.Status)){if(!allowFailure)assert.equal(s.Status,'Completed',s.ErrorMessage);return s;}await new Promise(r=>setTimeout(r,500));}throw Error(`Task ${id} timed out`);}
try{
 let ready=false;for(let i=0;i<120;i++){if(server.exitCode!==null)throw Error('Server exited');const r=await probe.get('/api/v1/systeminfo',{timeout:1000}).catch(()=>null);if(r&&[200,401].includes(r.status())){ready=true;break;}await new Promise(r=>setTimeout(r,500));}assert(ready);
 const login=await probe.post('/api/v1/auth/login',{data:{Password:password,RememberMe:false}});assert(login.ok());const {AccessToken}=await login.json();
 api=await request.newContext({baseURL:apiUrl,extraHTTPHeaders:{Authorization:`Bearer ${AccessToken}`,'X-Ui-Language':'en-US'}});

 const info=await json('get','/api/v1/systeminfo');assert.equal(info.APIExtensions.includes('v1:backup:skip-next-run'),supported);record('server',{version:info.ServerVersion??info.Version,supported,run});
 await json('patch','/api/v1/serversettings',{'shown-welcome-page-v1':'true','has-asked-for-password-change':'true'});
 const first=new Date(Math.ceil((Date.now()+(supported?60000:86400000))/1000)*1000).toISOString();
 async function create(name,schedule){const dir=path.join(run,name),source=path.join(dir,'source'),remote=path.join(dir,'remote');await fs.mkdir(source,{recursive:true});await fs.mkdir(remote);await fs.writeFile(path.join(source,'report.txt'),'NGT086 actual scheduled backup');const r=await json('post','/api/v1/backups',{Backup:{Name:name,TargetURL:pathToFileURL(remote).href,Sources:[source+path.sep],Settings:[{Name:'--no-encryption',Value:'true'},{Name:'--snapshot-policy',Value:'off'}],Filters:[],Tags:[],Metadata:{}},Schedule:schedule});jobs.add(r.ID);return {id:r.ID,remote};}
 const scheduled=await create('NGT-086 scheduled',{Time:first,Repeat:supported?'301s':'1D',Rule:''});
 const unscheduled=await create('NGT-086 unscheduled',null);
 let disabled;if(info.APIExtensions.includes('v1:backup:enable-disable')){disabled=await create('NGT-086 disabled',{Time:new Date(Date.now()+86400000).toISOString(),Repeat:'1D',Rule:''});await json('post',`/api/v1/backup/${disabled.id}/disable`,{});}
 proxy=spawn(process.execPath,['tmp/editor627-20261114/proxy.mjs',String(apiPort),String(uiPort),'dist/ngclient/browser'],{windowsHide:true,stdio:['ignore','pipe','pipe']});await Promise.race([once(proxy.stdout,'data'),once(proxy,'exit').then(()=>{throw Error('Proxy exited')})]);
 browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:'en-US',timezoneId:'UTC',viewport:{width:1450,height:1250}});page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 let requests=0;page.on('response',async r=>{const u=new URL(r.url());if(u.pathname.endsWith('/skip-next-run')){requests++;wire.push({path:u.pathname,status:r.status(),response:await r.json()});}});
 page.on('websocket',ws=>ws.on('framereceived',({payload})=>{try{const p=JSON.parse(String(payload));if(['legacystatus','backuplist'].includes(p.Type))wire.push({kind:'websocket',type:p.Type,data:p.Data});}catch{}}));
 await page.goto(uiUrl+'/login');await page.getByPlaceholder('Enter your password').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();await expect(page).toHaveURL(uiUrl+'/',{timeout:30000});
 const card=name=>page.locator('app-home .backup').filter({hasText:name});
 await expect(card('NGT-086 scheduled')).toBeVisible({timeout:30000});
 async function menu(name,visible){await card(name).getByRole('button',{name:'More actions',exact:true}).click();await expect(page.getByRole('button',{name:'Skip next run',exact:true})).toHaveCount(visible?1:0);await page.screenshot({path:path.join(run,name.replaceAll(' ','-')+'-menu.png')});await page.keyboard.press('Escape');await page.mouse.click(900,85);record('menu-checked',{name,visible});}
 await menu('NGT-086 unscheduled',false);if(disabled)await menu('NGT-086 disabled',false);
 if(!supported){await menu('NGT-086 scheduled',false);assert.equal(requests,0);record('completed',{supported,pageErrors,skipRequests:requests});}
 else{
  await page.getByRole('button',{name:/Time:/}).click();await page.getByRole('button',{name:'Actual time',exact:true}).click();
  const next=card('NGT-086 scheduled').locator('p').filter({hasText:'Next scheduled run:'}).locator('.time-value');const before=await next.innerText();await page.screenshot({path:path.join(run,'before.png')});
  assert(Date.now()<Date.parse(first),'The first slot must still be in the future');
  await card('NGT-086 scheduled').getByRole('button',{name:'More actions',exact:true}).click();
  const response=page.waitForResponse(r=>r.url().endsWith(`/api/v1/backup/${scheduled.id}/skip-next-run`));await page.getByRole('button',{name:'Skip next run',exact:true}).click();const r=await response;assert(r.ok());const result=await r.json();assert.equal(result.Status,'OK');const afterTime=new Date(result.NextScheduledRun).toISOString();assert.equal(Date.parse(afterTime)-Date.parse(first),301000);
  await expect(next).not.toHaveText(before,{timeout:15000});const after=await next.innerText();const t=new Date(afterTime),hour=t.getUTCHours();const clock=`${hour%12||12}:${String(t.getUTCMinutes()).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;assert(after.replace(/\s+/g,' ').includes(clock),`${after} should include ${clock}`);
  const stored=await json('get',`/api/v1/backup/${scheduled.id}`);assert.equal(Date.parse(stored.Schedule.Time),Date.parse(afterTime));await page.screenshot({path:path.join(run,'after.png')});assert.equal(requests,1);assert.deepEqual(pageErrors,[]);record('skip-confirmed',{first,next:afterTime,before,after,requests,withoutReload:true});
  await browser.close();browser=null;page=null;let closed=once(server,'close');server.kill();await closed;server=launch();
  let restarted=false;for(let i=0;i<120;i++){const r=await probe.get('/api/v1/systeminfo',{timeout:1000}).catch(()=>null);if(r&&[200,401].includes(r.status())){restarted=true;break;}await new Promise(r=>setTimeout(r,500));}assert(restarted);
  const login=await probe.post('/api/v1/auth/login',{data:{Password:password,RememberMe:false}});assert(login.ok());const token=(await login.json()).AccessToken;await api.dispose();api=await request.newContext({baseURL:apiUrl,extraHTTPHeaders:{Authorization:`Bearer ${token}`,'X-Ui-Language':'en-US'}});
  const reloaded=await json('get',`/api/v1/backup/${scheduled.id}`);assert.equal(Date.parse(reloaded.Schedule.Time),Date.parse(afterTime));record('restart-retained',{next:reloaded.Schedule.Time});
  record('waiting-for-original-slot',{first,next:afterTime});
  while(Date.now()<Date.parse(first)+5000)await new Promise(r=>setTimeout(r,1000));
  const skipped=await json('get',`/api/v1/backup/${scheduled.id}`);assert(!skipped.Backup.Metadata?.LastBackupStarted);assert.equal((await fs.readdir(scheduled.remote)).length,0);record('original-slot-skipped',{first,metadata:skipped.Backup.Metadata,remoteFiles:0});
  let ran;for(let i=0;i<480;i++){const b=await json('get',`/api/v1/backup/${scheduled.id}`);if(b.Backup.Metadata?.LastBackupFinished){ran=b;break;}await new Promise(r=>setTimeout(r,1000));}assert(ran,'The following scheduled run did not finish');record('following-slot-metadata',{metadata:ran.Backup.Metadata});const started=ran.Backup.Metadata.LastBackupStarted.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z');assert(Date.parse(started)>=Date.parse(afterTime));const filesets=await json('post','/api/v2/backup/list-filesets',{BackupId:scheduled.id});assert(filesets.Success);assert.equal(filesets.Data.length,1);record('following-slot-ran',{started:ran.Backup.Metadata.LastBackupStarted,finished:ran.Backup.Metadata.LastBackupFinished,filesets:filesets.Data});await json('post','/api/v1/serverstate/pause',{});
  const queued=await create('NGT-086 queued',{Time:new Date(Date.now()-1000).toISOString(),Repeat:'1D',Rule:''});
  let queuedTask;for(let i=0;i<30;i++){const state=await json('get','/api/v1/serverstate');queuedTask=state.SchedulerQueueIds?.find(t=>String(t.Item2)===String(queued.id));if(queuedTask)break;await new Promise(r=>setTimeout(r,500));}assert(queuedTask,'The paused overdue job was not queued');
  const advanced=await json('post',`/api/v1/backup/${queued.id}/skip-next-run`,{});const queueState=await json('get','/api/v1/serverstate');assert(queueState.SchedulerQueueIds.some(t=>t.Item1===queuedTask.Item1));record('queued-run-retained',{taskId:queuedTask.Item1,next:advanced.NextScheduledRun});
  await json('post','/api/v1/serverstate/resume',{});await task(queuedTask.Item1);const finishedQueued=await json('get',`/api/v1/backup/${queued.id}`);assert.equal(Date.parse(finishedQueued.Schedule.Time),Date.parse(advanced.NextScheduledRun));record('queued-run-finished-without-undoing-skip',{next:finishedQueued.Schedule.Time});
  record('completed',{supported,pageErrors,skipRequests:requests});
 }

}catch(e){record('failed',{error:e.stack});if(page){await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(run,'failure.txt'),await page.locator('body').innerText()).catch(()=>{});}process.exitCode=1;
}finally{
 if(api){for(const entry of await json('get','/api/v1/backups'))jobs.add(entry.Backup.ID);for(const id of jobs){try{const d=await api.delete(`/api/v1/backup/${id}`,{params:{'delete-local-db':'true','delete-remote-files':'false'}});assert(d.ok());const r=await d.json();if(r.ID)await task(r.ID);}catch(e){record('cleanup-failed',{message:e.message});process.exitCode=1;}}record('cleanup',{remainingJobs:(await json('get','/api/v1/backups')).length});}
 await browser?.close();await api?.dispose();await probe.dispose();for(const child of [proxy,server])if(child?.pid&&child.exitCode===null&&child.signalCode===null){const closed=once(child,'close');child.kill();await closed;}await new Promise(r=>log.end(r));
 await fs.writeFile(path.join(run,'events.json'),JSON.stringify(events,null,2));await fs.writeFile(path.join(run,'wire.json'),JSON.stringify(wire,null,2));await fs.writeFile(path.join(root,'latest-run.txt'),run);
}
