export type UUID=string; export type Role='CDO'|'CO'|'BM'|'AM'|'RM'|'ADMIN'; export type Department='DABI'|'PROGOTI'|'SHARED'; export type Product='DABI'|'PROGOTI';
export type ApplicationStatus='DRAFT'|'SUBMITTED_BY_CDO'|'BM_REVIEW'|'BM_RECOMMENDED'|'SUBMITTED_BY_CO'|'AM_REVIEW'|'AM_RECOMMENDED'|'RM_REVIEW'|'RETURNED_FOR_CORRECTION'|'ADDITIONAL_VERIFICATION_REQUIRED'|'APPROVED'|'REJECTED';
export type WorkflowAction='SUBMIT'|'START_REVIEW'|'RECOMMEND'|'RETURN'|'REQUEST_ADDITIONAL_VERIFICATION'|'APPROVE'|'REJECT';
export interface AuthUser{id:UUID;username:string;role:Role;department:Department;branchId:UUID|null;areaId:UUID|null;regionId:UUID|null;active:boolean}
export interface Application{id:UUID;product:Product;customerId:UUID;status:ApplicationStatus;version:number;ownerId:UUID;branchId:UUID;areaId:UUID;regionId:UUID}
export interface ApiEnvelope<T>{data:T;meta?:Record<string,unknown>}
