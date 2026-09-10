import type { Application, AuthUser, ApplicationStatus, Role, WorkflowAction } from '@geocredit/types';

export interface TransitionRule { from: ApplicationStatus; action: WorkflowAction; role: Role; to: ApplicationStatus }

export const dabiRules: readonly TransitionRule[] = [
  { from: 'RETURNED_FOR_CORRECTION', action: 'SUBMIT', role: 'CDO', to: 'SUBMITTED_BY_CDO' },
  { from: 'AM_REVIEW', action: 'START_REVIEW', role: 'AM', to: 'AM_REVIEW' },
  { from: 'RM_REVIEW', action: 'START_REVIEW', role: 'RM', to: 'RM_REVIEW' },
  { from: 'DRAFT', action: 'SUBMIT', role: 'CDO', to: 'SUBMITTED_BY_CDO' },
  { from: 'SUBMITTED_BY_CDO', action: 'RECOMMEND', role: 'BM', to: 'BM_RECOMMENDED' },
  { from: 'SUBMITTED_BY_CDO', action: 'APPROVE', role: 'BM', to: 'APPROVED' },
  { from: 'SUBMITTED_BY_CDO', action: 'RETURN', role: 'BM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'BM_REVIEW', action: 'RECOMMEND', role: 'BM', to: 'BM_RECOMMENDED' },
  { from: 'BM_REVIEW', action: 'RETURN', role: 'BM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'BM_RECOMMENDED', action: 'START_REVIEW', role: 'AM', to: 'AM_REVIEW' },
  { from: 'BM_RECOMMENDED', action: 'RETURN', role: 'AM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'AM_REVIEW', action: 'RECOMMEND', role: 'AM', to: 'AM_RECOMMENDED' },
  { from: 'AM_REVIEW', action: 'APPROVE', role: 'AM', to: 'APPROVED' },
  { from: 'BM_RECOMMENDED', action: 'RETURN', role: 'AM', to: 'BM_REVIEW' },
  { from: 'AM_REVIEW', action: 'RETURN', role: 'AM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'RM_REVIEW', action: 'APPROVE', role: 'RM', to: 'APPROVED' },
  { from: 'RM_REVIEW', action: 'REJECT', role: 'RM', to: 'REJECTED' },
  { from: 'AM_RECOMMENDED', action: 'START_REVIEW', role: 'RM', to: 'RM_REVIEW' },
  { from: 'AM_RECOMMENDED', action: 'RETURN', role: 'RM', to: 'AM_REVIEW' },
];

export function resolveTransition(status: ApplicationStatus, action: WorkflowAction, role: Role, product: string = 'DABI'): TransitionRule | undefined {
  if (product === 'PROGOTI') {
    if (role === 'CO' && action === 'SUBMIT' && ['DRAFT','RETURNED_FOR_CORRECTION'].includes(status)) return {from:status,action,role,to:'SUBMITTED_BY_CO'};
    if (role === 'AM' && action === 'START_REVIEW' && status === 'SUBMITTED_BY_CO') return {from:status,action,role,to:'AM_REVIEW'};
    return dabiRules.find(r=>!['CDO','BM'].includes(r.role) && r.from===status && r.action===action && r.role===role);
  }
  if(product !== 'DABI') return undefined;
  return dabiRules.find(r=>r.from===status && r.action===action && r.role===role);
}

export type ScopedRow = { branchId?: string; areaId?: string; regionId?: string; branch_id?: string; area_id?: string; region_id?: string; product?: string };
export function inScope(user: AuthUser, row: ScopedRow): boolean {
  if (!user.active) return false;
  if (row.product && user.department !== row.product && !(['AM','RM','ADMIN'].includes(user.role) && user.department === 'SHARED')) return false;
  const branch = row.branchId ?? row.branch_id, area = row.areaId ?? row.area_id, region = row.regionId ?? row.region_id;
  if (user.role === 'ADMIN') return true;
  if (!region || user.regionId !== region) return false;
  if (user.role === 'RM') return true;
  if (!area || user.areaId !== area) return false;
  if (user.role === 'AM') return true;
  return !!branch && user.branchId === branch;
}
export function allowedActions(user: AuthUser, app: Application & { reviewerId?: string | null }): WorkflowAction[] {
  if (!inScope(user, app)) return [];
  const actions: WorkflowAction[] = ['SUBMIT','START_REVIEW','RECOMMEND','RETURN','APPROVE','REJECT'];
  return actions.filter(action => {
    if (!resolveTransition(app.status, action, user.role, app.product)) return false;
    if (action === 'SUBMIT') return app.ownerId === user.id;
    if (action === 'START_REVIEW') return !app.reviewerId;
    return app.reviewerId === user.id || (user.role === 'BM' && app.status === 'SUBMITTED_BY_CDO' && ['RECOMMEND','APPROVE','REJECT','RETURN'].includes(action));
  });
}

export function canEdit(user: AuthUser, row: ScopedRow & { status: string; ownerId?: string; owner_id?: string; reviewerId?: string | null; reviewer_id?: string | null }): boolean {
  if (!inScope(user, row)) return false;
  if (user.role === 'CDO' || user.role === 'CO') return ['DRAFT','RETURNED_FOR_CORRECTION'].includes(row.status) && (row.ownerId ?? row.owner_id) === user.id && user.department === row.product;
  return ((user.role === 'BM' && row.status === 'BM_REVIEW') || (user.role === 'AM' && row.status === 'AM_REVIEW')) && (row.reviewerId ?? row.reviewer_id) === user.id;
}
