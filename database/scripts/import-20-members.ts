import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client } from 'pg';

export const SOURCE = 'GEOCREDIT_20_MEMBER_DATASET';
const directory = 'database/seed/datasets/geocredit20';
export const cdoNames = ['Nusrat Jahan','Arifa Khatun','Farzana Akter','Jannatul Ferdous'];
type Row = Record<string,string>;
export type Dataset = { members: Row[]; loans: Row[]; savings: Row[] };
function requireValue(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
export function money(value: string): string {
 requireValue(/^\d{1,12}(\.\d{1,2})?$/.test(value), 'Invalid numeric(14,2) money: '+value);
 const [whole, fraction=''] = value.split('.');
 return BigInt(whole).toString()+'.'+fraction.padEnd(2,'0');
}
function csv(text: string): Row[] {
 const [header,...lines] = text.trim().split(/\r?\n/);
 const keys=header.split(',');
 requireValue(new Set(keys).size===keys.length,'Duplicate CSV columns');
 return lines.map((line,index)=>{
  const values=line.split(',');
  requireValue(values.length===keys.length && values.every(v=>v.length>0&&!v.includes('"')), 'Invalid CSV row '+(index+2));
  return Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
 });
}
export function validate(data: Dataset): Dataset {
 const copy=structuredClone(data);
 const expected=Array.from({length:20},(_,i)=>'M'+(10001+i));
 for (const [kind,rows] of Object.entries(copy)) {
  requireValue(rows.length===20 && new Set(rows.map(r=>r.member_id)).size===20,kind+': expected 20 unique members');
  requireValue(rows.every(r=>expected.includes(r.member_id)),kind+': invalid member link');
 }
 requireValue(new Set(copy.members.map(r=>r.vo_no)).size===20,'Duplicate VO');
 for (const r of copy.members) {
  requireValue(r.member_name.trim().length>0 && cdoNames.includes(r.cdo_name),'Invalid member/CDO');
  requireValue(/^21\d{2}$/.test(r.vo_no) && r.vo_no>='2145' && r.vo_no<='2164','Invalid VO');
  requireValue(['Active','Closed'].includes(r.member_status),'Invalid member status');
 }
 requireValue(new Set(copy.loans.map(r=>r.loan_no)).size===20,'Duplicate loan');
 for (const r of copy.loans) {
  requireValue(/^\d{8}$/.test(r.loan_no) && ['Active','Closed'].includes(r.loan_status),'Invalid loan identifier/status');
  requireValue(r.loan_product==='General 24% Reducing','Unknown loan product');
  requireValue(/^\d{4}-\d{2}-\d{2}$/.test(r.disbursement_date) && !Number.isNaN(Date.parse(r.disbursement_date)) && new Date(r.disbursement_date).toISOString().slice(0,10)===r.disbursement_date,'Invalid disbursement date');
  for (const key of ['disbursed_amount','installment_amount','realized_amount','loan_due','overdue','principal_os']) r[key]=money(r[key]);
  for (const key of ['schedule_miss_count','partial_payment_count']) requireValue(/^\d+$/.test(r[key]) && Number(r[key])<=2147483647,'Invalid count');
  if(r.loan_status==='Closed') requireValue(['loan_due','overdue','principal_os'].every(k=>r[k]==='0.00'),'Closed loan has outstanding balance');
 }
 requireValue(new Set(copy.savings.map(r=>r.account_no)).size===20,'Duplicate savings account');
 for(const r of copy.savings) {
  requireValue(/^\d{11}$/.test(r.account_no) && ['Active','Closed'].includes(r.status),'Invalid account identifier/status');
  requireValue(r.savings_product==='General Savings' && r.account_type==='Compulsory Savings','Unknown savings product/type');
  for(const key of ['installment_amount','principal_amount','balance']) r[key]=money(r[key]);
 }
 return copy;
}
export async function loadDataset(): Promise<Dataset> {
 const texts=await Promise.all(['members','loans','savings'].map(name=>readFile(resolve(directory,name+'.csv'),'utf8')));
 return validate({members:csv(texts[0]),loans:csv(texts[1]),savings:csv(texts[2])});
}
export function assertLocalDemo(url: string, environment=process.env.APP_ENV): void {
 const parsed=new URL(url);
 requireValue(['development','demo','test'].includes(environment??'') && process.env.NODE_ENV!=='production','Explicit APP_ENV=development/demo/test required; production prohibited');
 requireValue(['127.0.0.1','localhost'].includes(parsed.hostname) && parsed.port==='55432','Only local demo PostgreSQL port 55432 is permitted');
 requireValue(/^\/geocredit(?:_import_test_[a-z0-9_]+)?$/.test(parsed.pathname),'Not the approved local demo/test database');
}
const uuid=(prefix:string,value:string)=>prefix+'-0000-4000-8000-'+value.padStart(12,'0');
// Test-live only: deterministic synthetic DOBs keep repeat imports idempotent.
const syntheticDob=(memberId:string)=>{const n=Number(memberId.slice(1))-10001;return `${1990+(n%10)}-${String(1+(n%12)).padStart(2,'0')}-${String(1+(n%27)).padStart(2,'0')}`;};

// Only owned rows may be updated. Any natural-key collision aborts the whole import.
async function upsert(client:Client,table:string,key:string,row:Record<string,unknown>):Promise<string> {
 const columns=Object.keys(row);
 const result=await client.query(
  'INSERT INTO '+table+' ('+columns.join(',')+') VALUES ('+columns.map((_,i)=>'$'+(i+1)).join(',')+') ON CONFLICT ('+key+') DO UPDATE SET '+
  columns.filter(k=>k!=='id' && k!==key).map(k=>k+'=EXCLUDED.'+k).join(',')+
  ' WHERE '+table+'.source_system=EXCLUDED.source_system RETURNING id',Object.values(row));
 requireValue(result.rowCount===1,'Refusing to overwrite non-imported '+table+' '+String(row[key]));
 return result.rows[0].id;
}
async function protectedState(client:Client):Promise<string> {
 const tables=['applications','application_versions','workflow_actions','loan_transactions','savings_transactions','financial_assessments'];
 const snapshots=[];
 for(const table of tables) snapshots.push((await client.query('SELECT md5(COALESCE(jsonb_agg(to_jsonb(t) ORDER BY id)::text,\'[]\')) AS hash FROM '+table+' t')).rows[0].hash);
 return JSON.stringify(snapshots);
}
export async function importDataset(client:Client, input:Dataset, applySchema=false) {
 const data=validate(input); // Validate all 60 supplied rows before any writes.
 await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
 try {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[SOURCE]);
  const before=await protectedState(client);
  if(applySchema) await client.query(await readFile(resolve('database/migrations/008_member_summary_import.sql'),'utf8'));
  const scope=(await client.query("SELECT branch_id,area_id,region_id FROM users WHERE username='cdo.demo' AND role='CDO' AND department='DABI' AND active")).rows[0];
  requireValue(scope?.branch_id && scope.area_id && scope.region_id,'Existing DABI demo CDO organizational scope required');
  const cdoIds=new Map<string,string>();
  for(const [index,name] of cdoNames.entries()) {
   const username=name.toLowerCase().replace(/ /g,'.')+'.demo';
   const matches=await client.query("SELECT * FROM users WHERE lower(trim(display_name))=lower($1) OR lower(username) IN (lower($2),lower($3),lower($1))",[name,username,username.slice(0,-5)]);
   requireValue((matches.rowCount??0)<=1,'Ambiguous existing CDO: '+name);
   if(matches.rowCount) {
    const user=matches.rows[0];
    requireValue(user.role==='CDO' && user.department==='DABI' && user.active && Object.entries(scope).every(([k,v])=>user[k]===v),'Existing CDO has incompatible scope: '+name);
    cdoIds.set(name,user.id);
   } else cdoIds.set(name,await upsert(client,'users','username',{id:uuid('10000020',String(index+1)),username,display_name:name,role:'CDO',department:'DABI',...scope,active:true,source_system:SOURCE}));
  }
  const memberIds=new Map<string,string>();
  for(const member of data.members) {
   const matches=await client.query("SELECT id FROM organizations WHERE kind='VO' AND parent_id=$1 AND code=$2",[scope.branch_id,member.vo_no]);
   const voId=matches.rows[0]?.id ?? await upsert(client,'organizations','id',{id:uuid('00000020',member.vo_no),name:'VO '+member.vo_no,kind:'VO',code:member.vo_no,parent_id:scope.branch_id,source_system:SOURCE});
   memberIds.set(member.member_id,await upsert(client,'customers','customer_ref',{
    id:uuid('20000020',member.member_id.slice(1)),customer_ref:member.member_id,display_name:member.member_name,
    ...scope,member_status:member.member_status.toUpperCase(),date_of_birth:syntheticDob(member.member_id),vo_code:member.vo_no,vo_id:voId,
    assigned_cdo_id:cdoIds.get(member.cdo_name),source_system:SOURCE
   }));
  }
  // Test-live only: deterministic synthetic Dhaka coordinates for radius-demo coverage.
  for(const member of data.members){const n=Number(member.member_id.slice(1))-10001;const lat=23.7800+((n%5)-2)*0.0007;const lon=90.4100+(Math.floor(n/5)-1)*0.0007;await client.query("INSERT INTO customer_locations(customer_id,location,location_status) VALUES($1,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,'VALID') ON CONFLICT(customer_id) DO UPDATE SET location=EXCLUDED.location,location_status='VALID',updated_at=now()",[memberIds.get(member.member_id),lon,lat]);}
  for(const loan of data.loans) await upsert(client,'loans','loan_ref',{
   id:uuid('30000020',loan.loan_no),customer_id:memberIds.get(loan.member_id),loan_ref:loan.loan_no,
   product:'DABI',product_name:loan.loan_product,status:loan.loan_status.toUpperCase(),
   principal:loan.disbursed_amount,outstanding:loan.principal_os,overdue:loan.overdue,started_on:loan.disbursement_date,
   installment_amount:loan.installment_amount,realized_amount:loan.realized_amount,loan_due:loan.loan_due,
   schedule_miss_count:loan.schedule_miss_count,partial_payment_count:loan.partial_payment_count,source_system:SOURCE
  });
  for(const loan of data.loans){const risk=Number(loan.overdue)>0?(Number(loan.overdue)>5000?'HIGH':'MODERATE'):'LOW';await client.query("INSERT INTO borrower_area_metrics(customer_id,loan_status,risk_level,has_current_overdue,has_recent_delay,savings_trend) VALUES($1,$2,$3,$4,$5,'STABLE') ON CONFLICT(customer_id) DO UPDATE SET loan_status=EXCLUDED.loan_status,risk_level=EXCLUDED.risk_level,has_current_overdue=EXCLUDED.has_current_overdue,has_recent_delay=EXCLUDED.has_recent_delay",[memberIds.get(loan.member_id),loan.loan_status.toUpperCase(),risk,Number(loan.overdue)>0,Number(loan.schedule_miss_count)>0]);}
  for(const account of data.savings) await upsert(client,'savings_accounts','account_no',{
   id:uuid('32000020',account.account_no),customer_id:memberIds.get(account.member_id),account_no:account.account_no,
   status:account.status.toUpperCase(),product:account.savings_product,account_type:account.account_type,
   installment_amount:account.installment_amount,principal_amount:account.principal_amount,balance:account.balance,source_system:SOURCE
  });
  const counts:Record<string,number>={};
  for(const table of ['customers','loans','savings_accounts']) {
   counts[table]=Number((await client.query('SELECT count(*) FROM '+table+' WHERE source_system=$1',[SOURCE])).rows[0].count);
   requireValue(counts[table]===20,'Unexpected imported count: '+table);
  }
  requireValue(before===await protectedState(client),'Existing workflow/transaction/assessment data changed');
  await client.query('COMMIT');
  return counts;
 } catch(error) { await client.query('ROLLBACK'); throw error; }
}
async function main(){
 const url=process.env.DATABASE_URL??'postgres://geocredit:geocredit@127.0.0.1:55432/geocredit';
 assertLocalDemo(url);
 const data=await loadDataset();
 if(process.argv.includes('--validate-only')) { console.log('Validated 20 members, 20 loans, 20 savings accounts'); return; }
 const client=new Client({connectionString:url});
 await client.connect();
 try {console.log(JSON.stringify(await importDataset(client,data,process.argv.includes('--apply-schema'))));}
 finally {await client.end();}
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) void main().catch(error=>{console.error(error.message);process.exitCode=1;});
