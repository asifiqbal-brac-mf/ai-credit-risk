import type { ApplicationStatus, Role, WorkflowAction } from '@geocredit/types';

export interface TransitionRule { from: ApplicationStatus; action: WorkflowAction; role: Role; to: ApplicationStatus }

export const dabiRules: readonly TransitionRule[] = [
  { from: 'DRAFT', action: 'SUBMIT', role: 'CDO', to: 'SUBMITTED_BY_CDO' },
  { from: 'SUBMITTED_BY_CDO', action: 'START_REVIEW', role: 'BM', to: 'BM_REVIEW' },
  { from: 'BM_REVIEW', action: 'RECOMMEND', role: 'BM', to: 'BM_RECOMMENDED' },
  { from: 'BM_REVIEW', action: 'APPROVE', role: 'BM', to: 'APPROVED' },
  { from: 'BM_REVIEW', action: 'REJECT', role: 'BM', to: 'REJECTED' },
  { from: 'BM_REVIEW', action: 'RETURN', role: 'BM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'BM_RECOMMENDED', action: 'START_REVIEW', role: 'AM', to: 'AM_REVIEW' },
  { from: 'BM_RECOMMENDED', action: 'APPROVE', role: 'AM', to: 'APPROVED' },
  { from: 'BM_RECOMMENDED', action: 'REJECT', role: 'AM', to: 'REJECTED' },
  { from: 'BM_RECOMMENDED', action: 'RETURN', role: 'AM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'AM_REVIEW', action: 'RECOMMEND', role: 'AM', to: 'AM_RECOMMENDED' },
  { from: 'AM_REVIEW', action: 'APPROVE', role: 'AM', to: 'APPROVED' },
  { from: 'AM_REVIEW', action: 'REJECT', role: 'AM', to: 'REJECTED' },
  { from: 'AM_REVIEW', action: 'RETURN', role: 'AM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'AM_RECOMMENDED', action: 'START_REVIEW', role: 'RM', to: 'RM_REVIEW' },
  { from: 'AM_RECOMMENDED', action: 'APPROVE', role: 'RM', to: 'APPROVED' },
  { from: 'AM_RECOMMENDED', action: 'REJECT', role: 'RM', to: 'REJECTED' },
  { from: 'AM_RECOMMENDED', action: 'RETURN', role: 'RM', to: 'RETURNED_FOR_CORRECTION' },
  { from: 'RM_REVIEW', action: 'RECOMMEND', role: 'RM', to: 'AM_RECOMMENDED' },
  { from: 'RM_REVIEW', action: 'APPROVE', role: 'RM', to: 'APPROVED' },
  { from: 'RM_REVIEW', action: 'REJECT', role: 'RM', to: 'REJECTED' },
  { from: 'RM_REVIEW', action: 'RETURN', role: 'RM', to: 'RETURNED_FOR_CORRECTION' },
];

export function resolveTransition(status: ApplicationStatus, action: WorkflowAction, role: Role): TransitionRule | undefined { return dabiRules.find(rule => rule.from === status && rule.action === action && rule.role === role); }
