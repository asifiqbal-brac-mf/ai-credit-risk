// Isolated local PostgreSQL verification. Never migrates/seeds the configured application database.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { Client } from 'pg';

const database = `geocredit_phase1_test_${randomUUID().replaceAll('-','').slice(0,12)}`;
const rootUrl = new URL(process.env.PHASE1_TEST_DATABASE_URL ?? 'postgres://geocredit:geocredit@127.0.0.1:55432/postgres');
assert.ok(['127.0.0.1','localhost'].includes(rootUrl.hostname),'Only local PostgreSQL is permitted');
const admin = new Client({connectionString:rootUrl.href});
let db, apiProcess, created=false;
const checks=[];
try {
  await admin.connect();
  await admin.query(`CREATE DATABASE "${database}"`); created=true;
  rootUrl.pathname='/'+database;
  db=new Client({connectionString:rootUrl.href});await db.connect();
  async function sqlDirectory(directory){for(const file of (await readdir(directory)).filter(f=>f.endsWith('.sql')).sort()) await db.query(await readFile(`${directory}/${file}`,'utf8'));}
  await sqlDirectory('database/migrations');await sqlDirectory('database/migrations');checks.push('migrations apply and rerun');
  await sqlDirectory('database/seed');
  await db.query("UPDATE applications SET status='APPROVED',version=99 WHERE id='90000000-0000-0000-0000-000000000101'");
  await sqlDirectory('database/seed');
  assert.deepEqual((await db.query("SELECT status,version FROM applications WHERE id='90000000-0000-0000-0000-000000000101'")).rows[0],{status:'APPROVED',version:99});checks.push('seed rerun preserves existing status/version');
  const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  apiProcess=spawn(process.execPath,['--import','tsx','apps/api/src/main.ts'],{env:{...process.env,DATABASE_URL:rootUrl.href,PORT:String(port),AUTH_PROVIDER:'development',APP_ENV:'test'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  let logs='';apiProcess.stdout.on('data',chunk=>{logs+=chunk});apiProcess.stderr.on('data',chunk=>{logs+=chunk});
  const base=`http://127.0.0.1:${port}`;
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    if(apiProcess.exitCode!==null)throw new Error('Test API failed to start: '+logs);
    try{const response=await fetch(base+'/health');if(response.ok){ready=true;break}}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(ready,'Test API must start');
  const smoke=spawn(process.execPath,['scripts/e2e-smoke.mjs'],{env:{...process.env,API_BASE_URL:base,E2E_ALLOW_MUTATIONS:'true'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  let smokeLog='';smoke.stdout.on('data',chunk=>{smokeLog+=chunk});smoke.stderr.on('data',chunk=>{smokeLog+=chunk});
  const [smokeCode]=await once(smoke,'exit');assert.equal(smokeCode,0,smokeLog);checks.push('CDO -> BM -> AM -> RM + final retry E2E');
  async function api(path,token,body,version,key,method){const response=await fetch(base+path,{method:method??(body?'POST':'GET'),headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} : {}),...(version!==undefined?{'If-Match':String(version)}:{}),...(key?{'Idempotency-Key':key}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,...await response.json()};}
  const login=async username=>(await api('/api/v1/auth/login',null,{username})).data;
  const cdo=await login('cdo.demo'),bm=await login('bm.demo');
  const secondId=randomUUID();await db.query("INSERT INTO users(id,username,role,department,branch_id,area_id,region_id) SELECT $1,'bm.concurrent',role,department,branch_id,area_id,region_id FROM users WHERE username='bm.demo'",[secondId]);
  const bm2=await login('bm.concurrent');
  const customer=(await api('/api/v1/customers',cdo.token)).data.find(row=>row.id==='20000000-0000-0000-0000-000000000001');
  const app=(await api('/api/v1/applications',cdo.token,{customerId:customer.id,branchId:customer.branchId,areaId:customer.areaId,regionId:customer.regionId,product:'DABI'})).data;
  const path=`/api/v1/applications/${app.id}/transitions`;
  assert.equal((await api(path,cdo.token,{action:'SUBMIT'},app.version,'incomplete-submit')).status,422);
  const geo=await api(`/api/v1/applications/${app.id}/geo-verification`,cdo.token,{mediaId:'40000000-0000-0000-0000-000000000001',latitude:23.78,longitude:90.279,accuracyMeters:100,capturedAt:new Date().toISOString()},app.version);assert.equal(geo.data.status,'VALID');
  const finance=await api(`/api/v1/applications/${app.id}/financial-assessment`,cdo.token,{monthlyIncome:25000,monthlyExpense:15000,externalDebt:0,proposedAmount:30000,proposedTermMonths:12},app.version,null,'PUT');assert.equal(finance.status,200);
  const scoringInput={incomeSource:{monthlyIncome:'25000',monthlyExpense:'15000',monthlyDebtPayment:'0',stability:'STABLE'},socialAcceptance:{rating:8},houseInfrastructure:{structure:'DURABLE',condition:'GOOD',basicUtilities:true}};
  const scorePath=`/api/v1/applications/${app.id}/assessments/CDO`;
  const incomplete=await api(scorePath,cdo.token,{},finance.data.version,'incomplete-score','PUT');assert.equal(incomplete.data.result.totalScore,null);
  const scored=await api(scorePath,cdo.token,scoringInput,incomplete.data.version,'complete-score','PUT');assert.equal(scored.status,200);
  const scoreReplay=await api(scorePath,cdo.token,scoringInput,incomplete.data.version,'complete-score','PUT');assert.equal(scoreReplay.data.replayed,true);
  const checklist={checklistType:'CDO',items:['IDENTITY_VERIFIED','EVIDENCE_REVIEWED','FINANCIALS_CONFIRMED'].map(code=>({code,label:code,complete:true}))};
  assert.equal((await api(`/api/v1/applications/${app.id}/checklists`,cdo.token,checklist,scored.data.version,null,'PUT')).status,200);
  const submitted=await api(path,cdo.token,{action:'SUBMIT'},scored.data.version,'submit-concurrency');assert.equal(submitted.status,201,JSON.stringify(submitted));
  checks.push('incomplete submission blocked; 100m GPS, complete assessment/checklist and assessment retry accepted');
  const claimVersion=submitted.data.version;
  const claims=await Promise.all([api(path,bm.token,{action:'START_REVIEW'},claimVersion,'claim-one'),api(path,bm2.token,{action:'START_REVIEW'},claimVersion,'claim-two')]);
  assert.deepEqual(claims.map(x=>x.status).sort(),[201,409]);
  const firstWon=claims[0].status===201, winner=firstWon?bm:bm2, loser=firstWon?bm2:bm, key=firstWon?'claim-one':'claim-two';
  const replay=await api(path,winner.token,{action:'START_REVIEW'},claimVersion,key);assert.equal(replay.meta.replayed,true);assert.equal(replay.data.version,claimVersion+1);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM workflow_actions WHERE application_id=$1 AND action='START_REVIEW'",[app.id])).rows[0].count,1);checks.push('concurrent claim: one winner, one audit record, safe replay');
  const winnerInbox=(await api('/api/v1/review/inbox',winner.token)).data;assert.ok(winnerInbox.some(item=>item.id===app.id));
  assert.ok(!(await api('/api/v1/review/inbox',loser.token)).data.some(item=>item.id===app.id));checks.push('START_REVIEW stays in owner inbox, hidden from other reviewers');
  assert.equal((await api(path,loser.token,{action:'RECOMMEND'},claimVersion+1,'denied-recommend')).status,403);
  assert.equal((await api(path,winner.token,{action:'APPROVE',confirmed:true},claimVersion+1,'denied-approve')).status,403);
  assert.equal((await api(path,winner.token,{action:'RECOMMEND'},claimVersion,key)).status,409);checks.push('assignment, RM-only final, and payload-bound idempotency enforced');
  const bmScore=await api(`/api/v1/applications/${app.id}/assessments/BM`,winner.token,{...scoringInput,socialAcceptance:{rating:5}},claimVersion+1,'bm-score','PUT');assert.equal(bmScore.status,200);
  const detail=(await api(`/api/v1/applications/${app.id}`,winner.token)).data;assert.equal(detail.assessments.canonical.role,'BM');assert.notEqual(detail.assessments.bm.result.totalScore,detail.assessments.cdo.result.totalScore);assert.equal(detail.assessments.cdo.result.totalScore,scored.data.result.totalScore);checks.push('separate CDO/BM scores, BM canonical result and category comparison');
  await assert.rejects(db.query('UPDATE client_assessments SET total_score=100 WHERE id=$1',[scored.data.id]),/Immutable snapshot/);
  await assert.rejects(db.query('DELETE FROM submission_snapshots WHERE application_id=$1',[app.id]),/Immutable snapshot/);checks.push('assessment and submission snapshots reject mutation');
  assert.equal((await api(`/api/v1/applications/${app.id}/assessments/BM`,winner.token,{...scoringInput,transactionHistory:{dueInstallments:100}},bmScore.data.version,'forged-history','PUT')).status,422);checks.push('client cannot forge server portfolio scoring facts');
  console.log(JSON.stringify({passed:checks.length,checks,isolatedDatabase:database}));
} finally {
  if(apiProcess && apiProcess.exitCode===null){const exited=once(apiProcess,'exit');apiProcess.kill();await exited;}
  if(db)await db.end();
  // Only the exact random database created by this process can be removed.
  if(created){assert.match(database,/^geocredit_phase1_test_[a-f0-9]{12}$/);await admin.query(`DROP DATABASE "${database}"`);console.log('Removed temporary test database '+database);}
  await admin.end();
}
