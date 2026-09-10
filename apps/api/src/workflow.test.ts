import { describe, expect, it } from 'vitest'; import { resolveTransition } from '@geocredit/workflow';
describe('Dabi workflow foundation',()=>{
 it('derives the first submission status from an action',()=>expect(resolveTransition('DRAFT','SUBMIT','CDO')?.to).toBe('SUBMITTED_BY_CDO'));
 it('denies non-RM final decisions',()=>expect(resolveTransition('RM_REVIEW','APPROVE','AM')).toBeUndefined());
 it('routes CDO submissions to BM recommendation',()=>expect(resolveTransition('SUBMITTED_BY_CDO','RECOMMEND','BM')?.to).toBe('BM_RECOMMENDED'));
 it('requires an internal RM claim before final decisions',()=>{expect(resolveTransition('AM_RECOMMENDED','START_REVIEW','RM')?.to).toBe('RM_REVIEW'); expect(resolveTransition('AM_RECOMMENDED','APPROVE','RM')).toBeUndefined(); expect(resolveTransition('RM_REVIEW','APPROVE','RM')?.to).toBe('APPROVED'); expect(resolveTransition('RM_REVIEW','REJECT','RM')?.to).toBe('REJECTED');});
});
