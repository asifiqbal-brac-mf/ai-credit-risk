import 'reflect-metadata';
import { beforeEach, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
const db=vi.hoisted(()=>({query:vi.fn(),connect:vi.fn(),release:vi.fn()}));
vi.mock('pg',()=>({Pool:class {query=db.query;connect=db.connect;}}));
import { ApiController } from './module';
const controller=new ApiController();
const actor={id:'10000000-0000-0000-0000-000000000001',username:'bm',role:'BM',department:'DABI',active:true,branchId:'b',areaId:'a',regionId:'r'};
const headers={authorization:'Bearer '+Buffer.from(actor.id).toString('base64url')};
const application={id:'20000000-0000-0000-0000-000000000001',customerId:'customer',product:'DABI',status:'SUBMITTED_BY_CDO',version:2,ownerId:'owner',reviewerId:null,branchId:'b',areaId:'a',regionId:'r'};
let row:Record<string,unknown>, user:Record<string,unknown>, prior:Record<string,unknown>|null;
beforeEach(()=>{
  vi.stubEnv('AUTH_PROVIDER','development');vi.stubEnv('APP_ENV','test');db.query.mockReset();db.connect.mockReset();db.release.mockReset();
  row={...application};user={...actor};prior=null;
  db.connect.mockResolvedValue({query:db.query,release:db.release});
  db.query.mockImplementation(async(sql:string)=>{
    if(sql.includes('FROM users'))return {rows:[user],rowCount:1};
    if(sql.includes('FROM applications'))return {rows:[row],rowCount:1};
    if(sql.includes('FROM workflow_actions'))return {rows:prior?[prior]:[],rowCount:prior?1:0};
    return {rows:[],rowCount:1};
  });
});
it('applies BM recommendation atomically',async()=>{
  const result=await controller.transition(headers,'2','recommend-key',application.id,{action:'RECOMMEND'});
  expect(result.data).toMatchObject({currentStatus:'BM_RECOMMENDED',version:3});
  expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE applications SET status=$1'),['BM_RECOMMENDED',3,application.id,2,null]);
  expect(db.query).toHaveBeenCalledWith(expect.stringContaining('request_hash'),expect.any(Array));
  expect(db.query).toHaveBeenCalledWith('COMMIT');expect(db.release).toHaveBeenCalled();
});
it('replays original version before optimistic-lock validation',async()=>{
  row.version=3;row.status='BM_REVIEW';row.reviewerId=actor.id;
  prior={workflowActionId:'action',applicationId:application.id,previousStatus:'SUBMITTED_BY_CDO',currentStatus:'BM_REVIEW',version:3,requestHash:createHash('sha256').update(JSON.stringify({id:application.id,ifMatch:'2',action:'START_REVIEW',remarks:null,confirmed:false})).digest('hex')};
  const result=await controller.transition(headers,'2','claim-key',application.id,{action:'START_REVIEW'});
  expect(result.meta.replayed).toBe(true);expect(result.data.version).toBe(3);expect(result.data).not.toHaveProperty('requestHash');
  expect(db.query.mock.calls.some(([sql])=>String(sql).startsWith('UPDATE'))).toBe(false);
});
it('rejects changed payload/key reuse',async()=>{prior={requestHash:'different'};await expect(controller.transition(headers,'2','claim-key',application.id,{action:'START_REVIEW'})).rejects.toMatchObject({status:409});expect(db.query).toHaveBeenCalledWith('ROLLBACK');});
it('rejects stale non-replay requests',async()=>{await expect(controller.transition(headers,'1','new-key',application.id,{action:'START_REVIEW'})).rejects.toMatchObject({status:409});});
it('rejects cross-scope requests before replay',async()=>{row.branchId='other';await expect(controller.transition(headers,'2','key',application.id,{action:'START_REVIEW'})).rejects.toMatchObject({status:403});});
it('rejects other reviewer actions',async()=>{row.status='BM_REVIEW';row.reviewerId='other';await expect(controller.transition(headers,'2','key',application.id,{action:'RECOMMEND'})).rejects.toMatchObject({status:403});});
it('rejects non-RM final decisions through controller',async()=>{row.status='BM_REVIEW';row.reviewerId=actor.id;await expect(controller.transition(headers,'2','key',application.id,{action:'APPROVE'})).rejects.toMatchObject({status:403});});
it('requires reject remarks for RM',async()=>{user.role='RM';row.status='RM_REVIEW';row.reviewerId=actor.id;await expect(controller.transition(headers,'2','key',application.id,{action:'REJECT'})).rejects.toMatchObject({status:422});});
it('requires explicit final confirmation',async()=>{user.role='RM';row.status='RM_REVIEW';row.reviewerId=actor.id;await expect(controller.transition(headers,'2','key',application.id,{action:'APPROVE'})).rejects.toMatchObject({status:422});});
it('accepts a confirmed RM decision',async()=>{user.role='RM';row.status='RM_REVIEW';row.reviewerId=actor.id;const result=await controller.transition(headers,'2','key',application.id,{action:'APPROVE',confirmed:true});expect(result.data.currentStatus).toBe('APPROVED');});
it('rolls back and releases on database failure',async()=>{db.query.mockImplementation(async(sql:string)=>{if(sql.includes('FROM users'))return {rows:[user]};if(sql.includes('FOR UPDATE'))throw new Error('database failure');return {rows:[]};});await expect(controller.transition(headers,'2','key',application.id,{action:'START_REVIEW'})).rejects.toThrow('database failure');expect(db.query).toHaveBeenCalledWith('ROLLBACK');expect(db.release).toHaveBeenCalled();});
