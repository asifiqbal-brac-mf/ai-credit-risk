import { describe, expect, it } from 'vitest'; import { resolveTransition } from '@geocredit/workflow';
describe('Dabi workflow foundation',()=>{
 it('derives the first submission status from an action',()=>expect(resolveTransition('DRAFT','SUBMIT','CDO')?.to).toBe('SUBMITTED_BY_CDO'));
 it('denies non-RM final decisions',()=>expect(resolveTransition('RM_REVIEW','APPROVE','AM')).toBeUndefined());
 it('requires the correct review order',()=>expect(resolveTransition('SUBMITTED_BY_CDO','RECOMMEND','BM')).toBeUndefined());
 it('limits RM decisions to approve or reject',()=>{expect(resolveTransition('AM_RECOMMENDED','START_REVIEW','RM')).toBeUndefined(); expect(resolveTransition('AM_RECOMMENDED','RETURN','RM')).toBeUndefined(); expect(resolveTransition('AM_RECOMMENDED','APPROVE','RM')?.to).toBe('APPROVED'); expect(resolveTransition('AM_RECOMMENDED','REJECT','RM')?.to).toBe('REJECTED');});
});
