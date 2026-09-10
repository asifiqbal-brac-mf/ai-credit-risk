import { describe, expect, it } from 'vitest';
import { allowedActions, canEdit, dabiRules, inScope, resolveTransition } from '@geocredit/workflow';
import type { Application, AuthUser, Role } from '@geocredit/types';
const user: AuthUser = { id:'reviewer',username:'test',role:'BM',department:'DABI',active:true,branchId:'branch',areaId:'area',regionId:'region' };
const app: Application & {reviewerId?:string|null} = {id:'app',product:'DABI',customerId:'customer',ownerId:'owner',status:'BM_REVIEW',version:2,branchId:'branch',areaId:'area',regionId:'region',reviewerId:user.id};
describe('authorized workflow',()=>{
  for(const role of ['CDO','CO','BM','AM','ADMIN'] as Role[]) it(`${role} cannot finalize from any state`,()=>{
    for(const status of new Set(dabiRules.map(r=>r.from))) for(const action of ['APPROVE','REJECT'] as const) if(!((role==='BM'&&status==='SUBMITTED_BY_CDO'&&action==='APPROVE')||(role==='AM'&&status==='AM_REVIEW'&&action==='APPROVE'))) expect(resolveTransition(status,action,role)).toBeUndefined();
  });
  it('allows the claimed reviewer to recommend or return',()=>expect(allowedActions(user,app)).toEqual(['RECOMMEND','RETURN']));
  it('denies a different reviewer',()=>expect(allowedActions({...user,id:'other'},app)).toEqual([]));
  it('does not expose BM start-review for an unassigned legacy row',()=>expect(allowedActions(user,{...app,reviewerId:null})).toEqual([]));
  it('exposes direct BM actions after CDO submission',()=>expect(allowedActions(user,{...app,status:'SUBMITTED_BY_CDO',reviewerId:null})).toEqual(['RECOMMEND','RETURN','APPROVE']));
  it('denies inactive users',()=>expect(allowedActions({...user,active:false},app)).toEqual([]));
  it('denies a different department',()=>expect(allowedActions({...user,department:'PROGOTI'},app)).toEqual([]));
  it('does not grant a BM shared-department access',()=>expect(allowedActions({...user,department:'SHARED'},app)).toEqual([]));
  it('denies BM cross-branch access',()=>expect(inScope(user,{...app,branchId:'other'})).toBe(false));
  it('allows AM within area, not another area',()=>{expect(inScope({...user,role:'AM'}, {...app,branchId:'other'})).toBe(true);expect(inScope({...user,role:'AM'}, {...app,areaId:'other'})).toBe(false);});
  it('denies missing scope equality',()=>expect(inScope({...user,regionId:null},{})).toBe(false));
  it('allows shared RM only within region',()=>{expect(inScope({...user,role:'RM',department:'SHARED'},app)).toBe(true);expect(inScope({...user,role:'RM'}, {...app,regionId:'other'})).toBe(false);});
  it('requires creator for draft submission and editing',()=>{const cdo={...user,role:'CDO' as const};const draft={...app,status:'DRAFT' as const,ownerId:cdo.id};expect(allowedActions(cdo,draft)).toEqual(['SUBMIT']);expect(canEdit(cdo,draft)).toBe(true);expect(canEdit({...cdo,id:'other'},draft)).toBe(false);});
  it('denies terminal edits',()=>expect(canEdit(user,{...app,status:'APPROVED'})).toBe(false));
  it('does not apply Dabi BM rules to Progoti',()=>expect(resolveTransition('SUBMITTED_BY_CDO','START_REVIEW','BM','PROGOTI')).toBeUndefined());
});
