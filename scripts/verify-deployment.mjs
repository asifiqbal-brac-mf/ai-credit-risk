// Linux deployment gate. Service environment is read in memory and never printed.
import { readFileSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';
const [root,servicePid,mode='canary']=process.argv.slice(2);
assert.ok(root?.startsWith('/opt/geocredit-'));
assert.match(servicePid??'',/^\d+$/);
const env=Object.fromEntries(readFileSync(`/proc/${servicePid}/environ`,'utf8').split('\0').filter(Boolean).map(item=>{const i=item.indexOf('=');return [item.slice(0,i),item.slice(i+1)];}));
const port=mode==='live'?3001:31317;
let child;
try {
 if(mode!=='live')child=spawn(process.execPath,['--import','tsx','apps/api/src/main.ts'],{cwd:root,env:{...env,PORT:String(port)},stdio:['ignore','ignore','pipe']});
 let errors='';child?.stderr.on('data',chunk=>{errors+=chunk});
 const base=`http://127.0.0.1:${port}`;let ready=false;
 for(let i=0;i<60;i++){if(child?.exitCode!=null)throw new Error('Canary API failed to start');try{const res=await fetch(base+'/health');const payload=await res.json();if(payload.data?.database==='ok'){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
 assert.ok(ready,'API/database readiness failed');
 const policy=execFileSync(process.execPath,['--import','tsx','-e',"const r=require('./packages/risk-engine/src/index.ts');if(r.CLIENT_RULE_VERSION!=='demo-client-v1')process.exit(1)"],{cwd:root,env,encoding:'utf8'});void policy;
 if(env.AUTH_PROVIDER==='development'&&env.APP_ENV!=='production'){
  for(const username of ['cdo.demo','bm.demo','am.demo','rm.demo']){
   const res=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username})});assert.ok(res.ok,username+' login failed');const {data}=await res.json();const headers={Authorization:`Bearer ${data.token}`};
   const endpoint=data.user.role==='CDO'?'/api/v1/customers':'/api/v1/review/inbox';const list=await fetch(base+endpoint,{headers});assert.ok(list.ok,username+' scoped list failed');const records=(await list.json()).data;
   if(data.user.role!=='CDO'&&records[0]){const detail=await fetch(base+'/api/v1/applications/'+records[0].id,{headers});assert.ok(detail.ok,'Detail failed');const app=(await detail.json()).data;assert.ok(app.assessments);assert.ok(Array.isArray(app.allowedActions));}
  }
 }
 console.log(`${mode}: API, database, scoring module and available role read paths verified`);
}finally{if(child&&child.exitCode===null){const done=once(child,'exit');child.kill();await done;}}
