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
const root=path.resolve('tmp/ngt085-export-20261115');
const run=await fs.mkdtemp(path.join(root,'run-'));
const executable=process.env.NGT085_SERVER??(await fs.readFile('tmp/editor627-20261114/server-executable.txt','utf8')).trim();
const supported=process.env.NGT085_SUPPORTED==='true';
const password=randomUUID(),events=[],wire=[],jobs=new Set();
const record=(kind,data={})=>{events.push({kind,...data});console.log(JSON.stringify({kind,...data}));};
const port=async()=>{const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;};
const apiPort=await port(),uiPort=await port(),apiUrl=`http://127.0.0.1:${apiPort}`,uiUrl=`http://127.0.0.1:${uiPort}`;
const log=createWriteStream(path.join(run,'server.log'));
const server=spawn(executable,[`--server-datafolder=${path.join(run,'data')}`,'--allow-insecure-datafolder=true','--disable-db-encryption=true',`--webservice-port=${apiPort}`,'--webservice-interface=loopback',`--webservice-password=${password}`],{cwd:path.dirname(executable),env:{...process.env,DOTNET_ROOT:process.env.NGT085_DOTNET_ROOT??process.env.DOTNET_ROOT},windowsHide:true,stdio:['ignore','pipe','pipe']});
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
 const info=await json('get','/api/v1/systeminfo');record('server',{version:info.ServerVersion??info.Version,OSType:info.OSType,supported,run});
 await json('patch','/api/v1/serversettings',{'--send-mail-to':'ngt085@example.invalid','--send-mail-password':'isolated-test-mail-secret','--blocksize':'1mb'});
 const source=path.join(run,'source'),remote=path.join(run,'remote');await fs.mkdir(source);await fs.mkdir(remote);await fs.writeFile(path.join(source,'report.txt'),'NGT085');
 const created=await json('post','/api/v1/backups',{Backup:{Name:'NGT-085 Export',TargetURL:pathToFileURL(remote).href,Sources:[source+path.sep],Settings:[{Name:'--no-encryption',Value:'true'},{Name:'blocksize',Value:'50kb'},{Name:'--snapshot-policy',Value:'off'}],Filters:[],Tags:[],Metadata:{}},Schedule:null});const id=created.ID;jobs.add(id);
 const before=await json('get',`/api/v1/backup/${id}`);
 proxy=spawn(process.execPath,['tmp/editor627-20261114/proxy.mjs',String(apiPort),String(uiPort),'dist/ngclient/browser'],{windowsHide:true,stdio:['ignore','pipe','pipe']});await Promise.race([once(proxy.stdout,'data'),once(proxy,'exit').then(()=>{throw Error('Proxy exited')})]);
 browser=await chromium.launch({headless:true});const context=await browser.newContext({locale:'en-US',viewport:{width:1450,height:1100}});page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('response',r=>{const u=new URL(r.url());if(u.pathname.endsWith('/export')||u.pathname.endsWith('/export-cmdline'))wire.push({case:currentCase,path:u.pathname,query:Object.fromEntries([...u.searchParams].filter(([k])=>k!=='token')),status:r.status()});});
 await page.goto(uiUrl+'/login');await page.getByPlaceholder('Enter your password').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();await expect(page).toHaveURL(uiUrl+'/',{timeout:20000});
 const settings=b=>Object.fromEntries(b.Backup.Settings.map(x=>[x.Name,x.Value]));
 for(const mode of ['default','include','passwords','encrypted']){
  currentCase=mode;await page.goto(uiUrl+`/backup/${id}/export`);const form=page.locator('app-export');await expect(form).toBeVisible();
  const include=form.locator('input[name$=".includeGlobalOptions"]');await expect(include).not.toBeChecked();
  if(mode!=='default'){await include.focus();await include.press('Space');await expect(include).toBeChecked();}
  const passwords=mode==='passwords'||mode==='encrypted';if(!passwords)await form.locator('input[name$=".exportPasswords"]').uncheck();
  if(mode==='encrypted'){await form.locator('input[name$=".encryption"]').check();await page.getByPlaceholder('Password',{exact:true}).fill('ngt085-isolated-export-secret');await page.getByPlaceholder('Repeat password',{exact:true}).fill('ngt085-isolated-export-secret');}
  await page.screenshot({path:path.join(run,mode+'-form.png')});
  const downloading=page.waitForEvent('download');await form.getByRole('button',{name:'Export',exact:true}).click();
  if(mode==='passwords')await page.getByRole('button',{name:'Yes, write plain-text passwords',exact:true}).click();
  const download=await downloading;const save=path.join(run,download.suggestedFilename());await download.saveAs(save);const bytes=await fs.readFile(save);let config;
  if(mode==='encrypted'){
   assert.equal(bytes.subarray(0,3).toString(),'AES');
   const imported=await json('post','/api/v1/backups/import',{config:bytes.toString('base64'),cmdline:false,import_metadata:true,direct:true,temporary:false,passphrase:'ngt085-isolated-export-secret',replace_settings:null});assert(imported.Id);jobs.add(imported.Id);const token=await json('post','/api/v1/auth/issuetoken/export',{});const exported=await api.get(`/api/v1/backup/${imported.Id}/export?export-passwords=true&token=${encodeURIComponent(token.Token)}`);assert(exported.ok());config=JSON.parse(await exported.text());
  }else config=JSON.parse(bytes.toString());
  const opts=settings(config);assert.equal(opts.blocksize,'50kb');assert(!('--blocksize' in opts));
  const included=supported&&mode!=='default';assert.equal(opts['--send-mail-to'],included?'ngt085@example.invalid':undefined);assert.equal(opts['--send-mail-password'],included&&passwords?'isolated-test-mail-secret':undefined);
  record('case-passed',{mode,supported,filename:download.suggestedFilename(),includedGlobal:!!opts['--send-mail-to'],includedPassword:!!opts['--send-mail-password'],jobBlocksize:opts.blocksize});
 }
 currentCase='command-line';await page.goto(uiUrl+`/backup/${id}/export`);await page.getByRole('button',{name:'As command line',exact:true}).click();await expect(page.locator('input[name$=".includeGlobalOptions"]')).toHaveCount(0);await page.locator('input[name$=".exportPasswords"]').uncheck();await page.locator('app-export').getByRole('button',{name:'Export',exact:true}).click();await expect(page.locator('.cmd-output code')).toContainText('ngt085@example.invalid');record('case-passed',{mode:'command-line',globalControlHidden:true,globalMailPresent:true});
 const after=await json('get',`/api/v1/backup/${id}`);assert.deepEqual(after.Backup.Settings,before.Backup.Settings);assert.deepEqual(pageErrors,[]);record('completed',{cases:5,supported,pageErrors,storedJobUnchanged:true});

}catch(e){record('failed',{error:e.stack});if(page){await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});await fs.writeFile(path.join(run,'failure.txt'),await page.locator('body').innerText()).catch(()=>{});}process.exitCode=1;
}finally{
 if(api){for(const entry of await json('get','/api/v1/backups'))jobs.add(entry.Backup.ID);for(const id of jobs){try{const d=await api.delete(`/api/v1/backup/${id}`,{params:{'delete-local-db':'true','delete-remote-files':'false'}});assert(d.ok());const r=await d.json();if(r.ID)await task(r.ID);}catch(e){record('cleanup-failed',{message:e.message});process.exitCode=1;}}record('cleanup',{remainingJobs:(await json('get','/api/v1/backups')).length});}
 await browser?.close();await api?.dispose();await probe.dispose();for(const child of [proxy,server])if(child?.pid&&child.exitCode===null&&child.signalCode===null){const closed=once(child,'close');child.kill();await closed;}await new Promise(r=>log.end(r));
 await fs.writeFile(path.join(run,'events.json'),JSON.stringify(events,null,2));await fs.writeFile(path.join(run,'wire.json'),JSON.stringify(wire,null,2));await fs.writeFile(path.join(root,'latest-run.txt'),run);
}
