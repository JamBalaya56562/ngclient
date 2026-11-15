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
const root=path.resolve('tmp/ngt084-verify-20261115');
const run=await fs.mkdtemp(path.join(root,'run-'));
const executable=(await fs.readFile('tmp/editor627-20261114/server-executable.txt','utf8')).trim();
const password=randomUUID(),events=[],wire=[],jobs=new Set();
const record=(kind,data={})=>{events.push({kind,...data});console.log(JSON.stringify({kind,...data}));};
const port=async()=>{const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;};
const apiPort=await port(),uiPort=await port(),apiUrl=`http://127.0.0.1:${apiPort}`,uiUrl=`http://127.0.0.1:${uiPort}`;
const log=createWriteStream(path.join(run,'server.log'));
const server=spawn(executable,[`--server-datafolder=${path.join(run,'data')}`,'--allow-insecure-datafolder=true','--disable-db-encryption=true',`--webservice-port=${apiPort}`,'--webservice-interface=loopback',`--webservice-password=${password}`],{cwd:path.dirname(executable),windowsHide:true,stdio:['ignore','pipe','pipe']});
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
 const info=await json('get','/api/v1/systeminfo');record('server',{version:info.ServerVersion??info.Version,OSType:info.OSType,run});
 const source=path.join(run,'source'),remote=path.join(run,'remote');await fs.mkdir(source);await fs.mkdir(remote);await fs.writeFile(path.join(source,'report.txt'),'NGT-084 real verification data\n'.repeat(200));
 const created=await json('post','/api/v1/backups',{Backup:{Name:'NGT-084 Verify',TargetURL:pathToFileURL(remote).href,Sources:[source+path.sep],Settings:[{Name:'--no-encryption',Value:'true'},{Name:'--snapshot-policy',Value:'off'}],Filters:[],Tags:[],Metadata:{}},Schedule:null});const id=created.ID;jobs.add(id);
 const backup=await json('post',`/api/v1/backup/${id}/start`,{});record('backup-completed',{task:await task(backup.ID)});
 proxy=spawn(process.execPath,['tmp/editor627-20261114/proxy.mjs',String(apiPort),String(uiPort),'dist/ngclient/browser'],{windowsHide:true,stdio:['ignore','pipe','pipe']});await Promise.race([once(proxy.stdout,'data'),once(proxy,'exit').then(()=>{throw Error('Proxy exited')})]);
 browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:'en-US',viewport:{width:1450,height:1100}});page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('websocket',ws=>ws.on('framereceived',({payload})=>{const text=String(payload);if(/taskcompleted/i.test(text))wire.push({case:currentCase,kind:'websocket',payload:JSON.parse(text)});}));
 page.on('response',async r=>{const u=new URL(r.url());if(/\/verify$|\/task\/\d+$/.test(u.pathname)){try{wire.push({case:currentCase,path:u.pathname,status:r.status(),response:await r.json()});}catch{}}});
 await page.goto(uiUrl+'/login');await page.getByPlaceholder('Enter your password').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();await expect(page).toHaveURL(uiUrl+'/',{timeout:20000});
 async function verify(mode,expected){currentCase=mode;await page.reload();await page.getByRole('button',{name:'More actions',exact:true}).click();const response=page.waitForResponse(r=>r.url().endsWith(`/api/v1/backup/${id}/verify`)&&r.request().method()==='POST');await page.getByRole('button',{name:'Verify files',exact:true}).click();const queued=await (await response).json();const completed=await task(queued.ID,true);record('verify-task',{mode,task:completed});const message=page.getByText(expected==='success'?'Verification of backup files completed successfully.':/^Verification of backup files failed:/,{exact:expected==='success'});await expect(message).toBeVisible({timeout:20000});const text=await message.innerText();if(expected==='success'){assert.equal(completed.Status,'Completed');assert(completed.ErrorMessage==null);}else assert(completed.Status==='Failed'||completed.ErrorMessage!=null);await page.screenshot({path:path.join(run,mode+'.png')});record('case-passed',{mode,queued,task:completed,notification:text});}
 await verify('healthy','success');
 const dblock=(await fs.readdir(remote)).find(n=>n.includes('.dblock.'));assert(dblock);const file=path.join(remote,dblock),original=await fs.readFile(file);const corrupt=Buffer.from(original);corrupt[Math.floor(corrupt.length/2)]^=255;await fs.writeFile(file,corrupt);
 await verify('corrupt-volume','failure');await fs.writeFile(file,original);
 await fs.rename(remote,remote+'-unavailable');await verify('missing-destination','failure');await fs.rename(remote+'-unavailable',remote);
 await verify('recovered','success');assert.deepEqual(pageErrors,[]);record('completed',{cases:4,pageErrors});
}catch(e){record('failed',{error:e.stack});if(page){await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(run,'failure.txt'),await page.locator('body').innerText()).catch(()=>{});}process.exitCode=1;
}finally{
 if(api){for(const id of jobs){try{const d=await api.delete(`/api/v1/backup/${id}`,{params:{'delete-local-db':'true','delete-remote-files':'false'}});assert(d.ok());const r=await d.json();if(r.ID)await task(r.ID);}catch(e){record('cleanup-failed',{message:e.message});process.exitCode=1;}}record('cleanup',{remainingJobs:(await json('get','/api/v1/backups')).length});}
 await browser?.close();await api?.dispose();await probe.dispose();for(const child of [proxy,server])if(child?.pid&&child.exitCode===null&&child.signalCode===null){const closed=once(child,'close');child.kill();await closed;}await new Promise(r=>log.end(r));
 await fs.writeFile(path.join(run,'events.json'),JSON.stringify(events,null,2));await fs.writeFile(path.join(run,'wire.json'),JSON.stringify(wire,null,2));await fs.writeFile(path.join(root,'latest-run.txt'),run);
}
