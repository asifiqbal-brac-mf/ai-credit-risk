import { HttpException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import type { AuthUser } from '@geocredit/types';
import { canEdit, inScope } from '@geocredit/workflow';
import { assessmentSchema } from '@geocredit/validation';
import { calculateClientScore, CLIENT_RULE_VERSION } from '@geocredit/risk-engine';

type DB=Pick<PoolClient,'query'>;
function fail(status:number,code:string,message:string):never{throw new HttpException({error:{code,message,requestId:randomUUID()}},status);}
export const CHECKLIST_CODES=['IDENTITY_VERIFIED','EVIDENCE_REVIEWED','FINANCIALS_CONFIRMED'];
export async function gpsPolicy(db:DB){const r=await db.query("SELECT version,definition FROM scoring_rules WHERE version='demo-gps-v1'");if(!r.rowCount)fail(503,'POLICY_UNAVAILABLE','GPS policy is unavailable');return r.rows[0];}
export async function assessmentBundle(db:DB,id:string){
  const rows=(await db.query('SELECT DISTINCT ON (assessor_role) id,assessor_role AS role,application_version AS version,raw_input AS "rawInput",result,complete,created_at AS "createdAt" FROM client_assessments WHERE application_id=$1 ORDER BY assessor_role,application_version DESC',[id])).rows;
  const cdo=rows.find(r=>r.role==='CDO')??null,bm=rows.find(r=>r.role==='BM')??null;
  const canonical=(await db.query("SELECT id,assessor_role AS role,result,created_at AS \"createdAt\" FROM client_assessments WHERE application_id=$1 AND complete ORDER BY CASE assessor_role WHEN 'BM' THEN 0 ELSE 1 END,application_version DESC LIMIT 1",[id])).rows[0]??null;
  const differences=(cdo?.result.categories??[]).map((c:{key:string;score:string|null})=>{const other=bm?.result.categories.find((b:{key:string})=>b.key===c.key);return {category:c.key,cdo:c.score,bm:other?.score??null,difference:c.score!==null&&other?.score!=null?(Number(other.score)-Number(c.score)).toFixed(2):null};});
  return {cdo,bm,canonical,differences,legacy:!cdo&&!bm};
}
export async function saveAssessment(pool:Pool,user:AuthUser,id:string,role:string,version:string|undefined,key:string|undefined,body:unknown){
  if(!key||key.length>200)fail(400,'IDEMPOTENCY_KEY_REQUIRED','Assessment Idempotency-Key is required');
  const parsed=assessmentSchema.safeParse(body);if(!parsed.success)fail(422,'VALIDATION_ERROR',parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));
  const hash=createHash('sha256').update(JSON.stringify({id,role,version,input:parsed.data})).digest('hex');
  const db=await pool.connect();
  try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[user.id+':assessment:'+key]);
    const app=(await db.query('SELECT * FROM applications WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(!app||!inScope(user,app))fail(404,'RESOURCE_NOT_FOUND','Application not found');
    const prior=(await db.query('SELECT id,application_version AS version,result,request_hash AS hash FROM client_assessments WHERE created_by=$1 AND idempotency_key=$2',[user.id,key])).rows[0];
    if(prior){if(prior.hash!==hash)fail(409,'IDEMPOTENCY_CONFLICT','Key belongs to another assessment request');await db.query('COMMIT');return {id:prior.id,version:prior.version,result:prior.result,replayed:true};}
    if(role!==user.role||!['CDO','BM'].includes(role)||app.product!=='DABI'||!canEdit(user,app))fail(403,'ROLE_PERMISSION_DENIED','Only the current Dabi assessor can save this assessment');
    if(version!==String(app.version))fail(409,'RESOURCE_VERSION_CONFLICT','Application version is stale');
    const financial=(await db.query('SELECT * FROM financial_assessments WHERE application_id=$1 ORDER BY application_version DESC LIMIT 1',[id])).rows[0];
    const history=(await db.query("SELECT count(*) FILTER(WHERE lt.target>0)::int AS due,count(*) FILTER(WHERE lt.target>0 AND lt.collection<lt.target)::int AS missed FROM loan_transactions lt JOIN loans l ON l.id=lt.loan_id WHERE l.customer_id=$1 AND l.product=$2 AND lt.collection_date<=CURRENT_DATE",[app.customer_id,app.product])).rows[0];
    const summary=(await db.query("SELECT COALESCE(sum(schedule_miss_count),0)::int AS schedule_miss_count,COALESCE(sum(partial_payment_count),0)::int AS partial_payment_count FROM loans WHERE customer_id=$1 AND product=$2 AND source_system='GEOCREDIT_20_MEMBER_DATASET'",[app.customer_id,app.product])).rows[0];
    const loans=(await db.query('SELECT sum(principal)::text AS principal,sum(overdue)::text AS overdue FROM loans WHERE customer_id=$1 AND product=$2',[app.customer_id,app.product])).rows[0];
    const savings=(await db.query('SELECT id,balance::text,transaction_date FROM savings_transactions WHERE customer_id=$1 ORDER BY transaction_date DESC,id DESC LIMIT 1',[app.customer_id])).rows[0];
    const summarySavings=(await db.query("SELECT balance::text,installment_amount::text AS monthly_installment FROM savings_accounts WHERE customer_id=$1 AND source_system='GEOCREDIT_20_MEMBER_DATASET' ORDER BY account_no LIMIT 1",[app.customer_id])).rows[0];
    const facts={transactionHistory:history?.due>0&&loans?.principal?{dueInstallments:history.due,missedInstallments:history.missed,principalAmount:loans.principal,overdueAmount:loans.overdue}:undefined,summary:summary?.schedule_miss_count>0?{scheduleMissCount:summary.schedule_miss_count,partialPaymentCount:summary.partial_payment_count}:undefined,savings:savings&&financial?{balance:savings.balance,monthlyInstallment:String(financial.proposed_installment)}:summarySavings?{balance:summarySavings.balance,monthlyInstallment:summarySavings.monthly_installment}:undefined,source:{asOf:new Date().toISOString(),financialAssessmentId:financial?.id??null,savingsTransactionId:savings?.id??null,product:app.product,summarySource:summarySavings?'GEOCREDIT_20_MEMBER_DATASET':null}};
    if(role==='CDO'&&financial&&parsed.data.incomeSource){
      for(const [field,column] of [['monthlyIncome','monthly_income'],['monthlyExpense','monthly_expense'],['monthlyDebtPayment','external_debt']] as const){
        const value=parsed.data.incomeSource[field];
        if(value!==undefined&&Number(value)!==Number(financial[column]))fail(422,'FINANCIAL_MISMATCH','CDO income, expense and monthly debt must match the saved financial assessment');
      }
    }
    const result=calculateClientScore(parsed.data,facts),next=app.version+1,assessmentId=randomUUID();
    await db.query('INSERT INTO client_assessments(id,application_id,application_version,assessor_role,created_by,rule_version,raw_input,portfolio_facts,result,complete,total_score,idempotency_key,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[assessmentId,id,next,role,user.id,CLIENT_RULE_VERSION,JSON.stringify(parsed.data),JSON.stringify(facts),JSON.stringify(result),result.classification!=='INCOMPLETE',result.totalScore,key,hash]);
    await db.query('UPDATE applications SET version=$2,updated_at=now() WHERE id=$1',[id,next]);
    await db.query('COMMIT');return {id:assessmentId,version:next,result,replayed:false};
  }catch(e){await db.query('ROLLBACK');throw e}finally{db.release();}
}

export async function freezeSubmission(db:DB,user:AuthUser,app:{id:string;product:string;version:number},action:string,nextVersion:number){
  if(app.product!=='DABI'||!(action==='SUBMIT'&&user.role==='CDO'))return;
  const assessment=(await db.query('SELECT * FROM client_assessments WHERE application_id=$1 AND assessor_role=$2 ORDER BY application_version DESC LIMIT 1',[app.id,user.role])).rows[0];
  const financial=(await db.query('SELECT * FROM financial_assessments WHERE application_id=$1 ORDER BY application_version DESC LIMIT 1',[app.id])).rows[0];
  const checklist=(await db.query('SELECT * FROM application_checklists WHERE application_id=$1 AND checklist_type=$2 ORDER BY application_version DESC LIMIT 1',[app.id,user.role])).rows[0];
  const geo=(await db.query("SELECT g.*,m.upload_status,m.media_type FROM geo_verifications g JOIN media_evidence m ON m.id=g.media_id WHERE g.application_id=$1 ORDER BY g.created_at DESC,g.id DESC LIMIT 1",[app.id])).rows[0];
  const policy=await gpsPolicy(db),limits=policy.definition;
  const problems:string[]=[];
  if(!assessment?.complete||assessment.created_by!==user.id)problems.push('complete '+user.role+' scoring assessment');
  if(!financial||Number(financial.proposed_amount)<=0||Number(financial.proposed_installment)<=0)problems.push('financial assessment');
  if(assessment&&financial&&assessment.portfolio_facts.source.financialAssessmentId!==financial.id)problems.push('recalculated score after financial changes');
  if(!checklist||checklist.updated_by!==user.id||(assessment&&checklist.application_version<assessment.application_version)||!CHECKLIST_CODES.every(code=>checklist.items.some((i:{code:string;complete:boolean})=>i.code===code&&i.complete)))problems.push('all required checklist confirmations after the latest assessment');
  const age=geo?(Date.now()-new Date(geo.captured_at).getTime())/1000:Infinity;
  if(!geo||geo.status!=='VALID'||!geo.verified_at||Number(geo.accuracy_meters)>limits.maximumAccuracyMeters||age>limits.maximumAgeSeconds||age < -limits.maximumFutureSkewSeconds)problems.push('fresh server-confirmed GPS');
  if(!geo||geo.upload_status!=='UPLOADED'||geo.media_type!=='HOUSE')problems.push('completed private HOUSE image');
  if(problems.length)fail(422,'ASSESSMENT_INCOMPLETE','Missing or stale: '+problems.join(', '));
  await db.query('INSERT INTO submission_snapshots(id,application_id,application_version,actor_id,action,payload) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),app.id,nextVersion,user.id,action,JSON.stringify({assessment,financial,checklist,geo,gpsPolicy:policy})]);
}
