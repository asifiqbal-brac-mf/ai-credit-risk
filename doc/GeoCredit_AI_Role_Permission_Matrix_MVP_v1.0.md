# GeoCredit AI — Role & Permission Matrix

**Version:** MVP v1.0  
**Status:** Draft for Development and UAT  
**Target:** Hackathon / 3-Day Demo MVP  
**Last Updated:** 03 September 2026

## 1. Purpose

This document defines role-based and scope-based permissions for GeoCredit AI. Permissions must be enforced by the backend and database policy where applicable. Hiding a button in the UI is not sufficient authorization.

## 2. Roles

| Role | Department | Platform | Responsibility |
|---|---|---|---|
| CDO | Dabi | Mobile/PWA | Customer, Dabi application, field assessment, GPS/image and submission |
| CO | Progoti | Mobile/PWA | Customer, Progoti application, checklists, GPS/image and submission |
| BM | Dabi | Mobile/PWA | Branch-level review, BM checklist, verification and recommendation |
| AM | Dabi and Progoti | Web | Area-level review, AM checklist/comment and recommendation |
| RM | Dabi and Progoti | Web | Regional final review and approve/reject decision |
| Admin | Platform support | Admin/Backend | Demo configuration and user setup; excluded from lending decisions |

## 3. Permission Legend

| Symbol | Meaning |
|---|---|
| C | Create |
| R | Read/View |
| U | Update/Edit |
| D | Delete |
| A | Perform workflow action |
| Own | Created/assigned records only |
| Scope | Records inside assigned organizational scope |
| — | Not permitted |

Normal business roles do not receive hard-delete permission for application, risk, workflow or audit records.

## 4. Data Scope Matrix

| Role | Department Scope | Organizational Scope | Record Scope |
|---|---|---|---|
| CDO | Dabi only | Assigned branch/VO | Assigned/created customers and Dabi applications |
| CO | Progoti only | Assigned branch/area | Assigned/created customers and Progoti applications |
| BM | Dabi only | Assigned branch | Dabi applications routed to their branch/review queue |
| AM | Dabi and/or Progoti per assignment | Assigned area | Applications routed to their area/review queue |
| RM | Dabi and/or Progoti per assignment | Assigned region | Applications routed to regional final review |
| Admin | Configured system scope | Explicit administrative scope | Configuration/support data only |

If a user has multiple assignments, each assignment must be explicit. Role alone must not grant national/global customer access.

## 5. Feature Permission Matrix

| Feature | CDO | CO | BM | AM | RM | Admin |
|---|---:|---:|---:|---:|---:|---:|
| Login/logout | R/A | R/A | R/A | R/A | R/A | R/A |
| View own profile/scope | R | R | R | R | R | R/U |
| Search customer | R Scope | R Scope | R Scope | R Scope | R Scope | R as approved |
| Create customer | C | C | — | — | — | Support only |
| Edit customer profile | U Own/Scope | U Own/Scope | — | — | — | Support only |
| View customer profile | R Scope | R Scope | R Assigned | R Assigned | R Assigned | Restricted |
| View loan behavior | R Scope | R Scope | R Assigned | R Assigned | R Assigned | Restricted |
| View savings behavior | R Scope | R Scope | R Assigned | R Assigned | R Assigned | Restricted |
| Create Dabi application | C | — | — | — | — | — |
| Create Progoti application | — | C | — | — | — | — |
| Edit application draft | U Own | U Own | — | — | — | — |
| View complete application | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| Enter CDO assessment | C/U | — | R | R | R | — |
| Enter CO assessment | — | C/U | — | R | R | — |
| Enter BM assessment | — | — | C/U | R | R | — |
| Enter AM assessment/comment | — | — | — | C/U | R | — |
| Capture primary GPS/image | C/U | C/U | Conditional | — | — | — |
| View GPS/image | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| View nearby borrower summary | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| View map/area intelligence | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| View AI risk report | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| Submit field application | A to BM | A to AM | — | — | — | — |
| Complete BM checklist | — | — | C/U | R | R | — |
| Complete AM checklist | — | — | — | C/U | R | — |
| Complete Progoti checklist | — | C/U | — | R | R | — |
| Complete document checklist | — | C/U | — | R | R | — |
| Recommend application | — | — | A to AM | A to RM | — | — |
| Return for correction | — | — | A | A | Optional policy | — |
| Request additional verification | — | — | A | A | Optional policy | — |
| Approve/reject | — | — | — | — | A | — |
| View workflow history | R Own | R Own | R Assigned | R Assigned | R Assigned | Restricted |
| View audit trail | Limited | Limited | Limited | Limited | Limited | Security role only |
| Configure rules/thresholds | — | — | — | — | — | U with separate approval |

## 6. Customer Field Permission Matrix

| Data Group | CDO | CO | BM | AM | RM | Nearby Borrower View |
|---|---|---|---|---|---|---|
| Member name | R/U Dabi | R/U Progoti | R | R | R | Hidden |
| Member number/reference | R/U | R/U | R | R | R | Masked/opaque reference |
| Organizational information | R/U Scope | R/U Scope | R | R | R | Hidden |
| DOB/family data | R/U | R/U | R | R | R | Hidden |
| NID/identity number | Masked U | Masked U | Masked R | Masked R | Masked R | Hidden |
| Occupation | R/U | R/U | R | R | R | Hidden |
| Present/permanent address | R/U | R/U | R | R | R | Hidden |
| Spouse/nominee | R/U | R/U | R | R | R | Hidden |
| Loan status | R | R | R | R | R | Summary only |
| Repayment behavior | R | R | R | R | R | Summary only |
| Savings behavior | R | R | R | R | R | Summary only |
| Risk level | R | R | R | R | R | Approved risk badge only |
| Exact coordinate | R Own | R Own | R Assigned | R Assigned | R Assigned | Hidden/approximated |
| House/business image | R Own | R Own | R Assigned | R Assigned | R Assigned | Hidden |

## 7. Application Field Permissions by State

| State | CDO | CO | BM | AM | RM |
|---|---|---|---|---|---|
| `DRAFT` Dabi | Edit/submit own | — | — | — | — |
| `DRAFT` Progoti | — | Edit/submit own | — | — | — |
| `SUBMITTED_BY_CDO` | Read | — | Start review | Read if routed | Read if routed |
| `BM_REVIEW` | Read | — | Edit BM fields/action | Read | Read |
| `BM_RECOMMENDED` | Read | — | Read | Start review | Read |
| `SUBMITTED_BY_CO` | — | Read | — | Start review | Read |
| `AM_REVIEW` | Read | Read | Read | Edit AM fields/action | Read |
| `AM_RECOMMENDED` | Read | Read | Read | Read | Start final review |
| `RM_REVIEW` | Read | Read | Read | Read | Approve/reject |
| `ADDITIONAL_VERIFICATION_REQUIRED` | Edit assigned fields if assigned | Edit assigned fields if assigned | Verify if assigned | Review/request | Review |
| `RETURNED_FOR_CORRECTION` | Edit Dabi if assigned | Edit Progoti if assigned | Edit BM fields if assigned | Review | Read |
| `APPROVED` | Read snapshot | Read snapshot | Read snapshot | Read snapshot | Read decision |
| `REJECTED` | Read snapshot | Read snapshot | Read snapshot | Read snapshot | Read decision |

Submitted versions are immutable. Corrections create a new application version rather than changing the historical snapshot.

## 8. Workflow Transition Matrix

| Current State | Role | Allowed Action | Next State | Mandatory Conditions |
|---|---|---|---|---|
| `DRAFT` | CDO | Submit | `SUBMITTED_BY_CDO` | Dabi; required data; valid GPS/image; risk ready |
| `SUBMITTED_BY_CDO` | BM | Start Review | `BM_REVIEW` | Assigned branch/scope |
| `BM_REVIEW` | BM | Recommend | `BM_RECOMMENDED` | BM checklist complete |
| `BM_REVIEW` | BM | Return | `RETURNED_FOR_CORRECTION` | Remarks required |
| `BM_REVIEW` | BM | Additional Verification | `ADDITIONAL_VERIFICATION_REQUIRED` | Remarks required |
| `BM_RECOMMENDED` | AM | Start Review | `AM_REVIEW` | Assigned area/scope |
| `DRAFT` | CO | Submit | `SUBMITTED_BY_CO` | Progoti; required data/checklists; valid GPS/image; risk ready |
| `SUBMITTED_BY_CO` | AM | Start Review | `AM_REVIEW` | Assigned area/scope |
| `AM_REVIEW` | AM | Recommend | `AM_RECOMMENDED` | Required AM checklist/comment complete |
| `AM_REVIEW` | AM | Return | `RETURNED_FOR_CORRECTION` | Remarks required |
| `AM_REVIEW` | AM | Additional Verification | `ADDITIONAL_VERIFICATION_REQUIRED` | Remarks required |
| `AM_RECOMMENDED` | RM | Start Review | `RM_REVIEW` | Assigned region/scope |
| `RM_REVIEW` | RM | Approve | `APPROVED` | Confirmation; remarks per policy |
| `RM_REVIEW` | RM | Reject | `REJECTED` | Remarks required |
| Returned/Verification | Assigned role | Resubmit | Previous review route | Required correction completed; new snapshot ready |

## 9. Checklist Ownership Matrix

| Checklist | Create/Update Owner | Viewers | Completion Gate |
|---|---|---|---|
| Dabi CDO information | CDO | BM, AM, RM | CDO submission |
| Dabi BM checklist | BM | AM, RM; CDO read if policy allows | BM recommendation |
| Dabi AM checklist | AM | RM; prior users read if policy allows | AM recommendation |
| Progoti initial checklist | CO | AM, RM | CO submission |
| Progoti document checklist | CO | AM, RM | Warning/block per configured required documents |
| Progoti loan assessment | CO | AM, RM | CO submission |
| Progoti AM/AAM comment | AM | RM | AM recommendation |

Checklist responses store respondent ID, role, template version and timestamp.

## 10. Geo and Media Permissions

| Action | CDO | CO | BM | AM | RM |
|---|---:|---:|---:|---:|---:|
| Capture house/business image | Yes | Yes | Conditional | No | No |
| Capture coordinates | Yes | Yes | Conditional | No | No |
| Replace evidence before submission | Yes | Yes | Conditional | No | No |
| Replace submitted evidence | Only through correction task | Only through correction task | Through assigned verification | No | No |
| View evidence | Own/scope | Own/scope | Assigned | Assigned | Assigned |
| Download original image | No by default | No by default | No by default | No by default | No by default |
| View map | Yes | Yes | Yes | Yes | Yes |
| View raw exact coordinate | Authorized application only | Authorized application only | Assigned only | Assigned only | Assigned only |

Media access must use short-lived application-authorized access. Direct public storage URLs are prohibited.

## 11. Risk and AI Permissions

| Action | CDO | CO | BM | AM | RM | Admin/Model Ops |
|---|---:|---:|---:|---:|---:|---:|
| Request risk for own valid draft | Yes | Yes | No | No | No | Support only |
| View frozen risk report | Yes | Yes | Yes | Yes | Yes | Restricted support |
| View risk reasons/evidence | Yes | Yes | Yes | Yes | Yes | Restricted support |
| Regenerate after correction | Yes if assigned | Yes if assigned | Request only | Request only | Request only | Controlled |
| Change score manually | No | No | No | No | No | No |
| Override final lending decision | No | No | No | No | Human RM decision independent of AI | No |
| Edit risk rules/thresholds | No | No | No | No | No | Controlled and approved |
| Promote model/rule version | No | No | No | No | No | Separate authorized role |

The risk engine has no permission to update the application to `APPROVED` or `REJECTED`.

## 12. Nearby Borrower Permissions

Authorized application users may view only:

- Opaque/masked customer reference
- Approximate distance or distance band
- Loan status
- Risk level
- Repayment summary
- Savings summary
- Approximate map marker if approved

They must not receive:

- Customer name
- NID or other identity number
- Phone number
- Exact address
- Exact coordinate
- House/business image
- Full loan transactions
- Full savings transactions
- Spouse/nominee/family information

## 13. Audit Permissions

| Audit Capability | CDO/CO | BM | AM | RM | Security/Admin |
|---|---:|---:|---:|---:|---:|
| View application timeline | Own | Assigned | Assigned | Assigned | As authorized |
| View technical/security metadata | No | No | No | No | Yes |
| Create audit event directly | No | No | No | No | No; system-generated |
| Update audit event | No | No | No | No | No normal path |
| Delete audit event | No | No | No | No | Retention-controlled only |
| Export audit data | No | No | No | No | Explicit authorization |

## 14. API Permission Matrix

| Endpoint/Operation | CDO | CO | BM | AM | RM |
|---|---:|---:|---:|---:|---:|
| `GET /customers` | Scope | Scope | Assigned | Assigned | Assigned |
| `POST /customers` | Dabi | Progoti | — | — | — |
| `PATCH /customers/{id}` | Own/scope | Own/scope | — | — | — |
| `POST /applications` | Dabi | Progoti | — | — | — |
| `PATCH /applications/{id}` | Own editable | Own editable | BM fields only | AM fields only | — |
| `POST /media/uploads` | Own app | Own app | Conditional | — | — |
| `POST /geo-verifications` | Own app | Own app | Conditional | — | — |
| `POST /area-queries` | Own valid app | Own valid app | Request if policy | Request if policy | Request if policy |
| `POST /risk-assessments` | Own valid app | Own valid app | Request after correction | Request after correction | Request if policy |
| `GET /risk-report` | Own | Own | Assigned | Assigned | Assigned |
| `GET /workflow/inbox` | Own tasks | Own tasks | BM queue | AM queue | RM queue |
| `POST /transitions` | Submit/resubmit | Submit/resubmit | BM actions | AM actions | RM actions |
| `GET /history` | Own | Own | Assigned | Assigned | Assigned |

## 15. Backend Authorization Rules

Every protected request must evaluate:

```text
authenticated
AND user.active
AND role permits operation
AND department permits resource
AND organizational scope contains resource
AND assignment permits record access where required
AND current workflow state permits operation
AND resource version is current for mutation
```

For nearby borrower access, the caller must also have access to the parent loan application and receive only the privacy-safe projection.

## 16. UI Behavior Rules

- Do not render actions the role cannot use.
- Disabled actions must explain missing prerequisites, not authorization details.
- Server rejection remains authoritative even if UI showed an action.
- Read-only submitted fields must look read-only, not disabled without explanation.
- Current role, department and organizational context should be visible in the user menu.
- Final Approve/Reject controls appear only for RM in `RM_REVIEW`.
- AI suggested action must not visually resemble an approval decision.

## 17. Separation of Duties

- The field officer who creates an application cannot record the final decision.
- BM and AM recommendation does not constitute final approval.
- RM decision is independent of the AI suggested action.
- Risk/model configuration should be separated from application review roles.
- Admin/support access should not grant lending decision permission.
- Production data export and audit export require separate explicit authorization.

## 18. Demo Accounts

| Demo User | Role | Department | Scope |
|---|---|---|---|
| `demo-cdo` | CDO | Dabi | Demo Branch A |
| `demo-co` | CO | Progoti | Demo Branch B |
| `demo-bm` | BM | Dabi | Demo Branch A |
| `demo-am` | AM | Both | Demo Area 1 |
| `demo-rm` | RM | Both | Demo Region 1 |

Demo accounts must use synthetic data and must not be available in production.

## 19. Permission Error Codes

| Code | HTTP | Meaning |
|---|---:|---|
| `AUTHENTICATION_REQUIRED` | 401 | Valid session required |
| `ACCOUNT_INACTIVE` | 403 | User account disabled |
| `ROLE_PERMISSION_DENIED` | 403 | Role cannot perform operation |
| `DEPARTMENT_SCOPE_DENIED` | 403 | Department does not match assignment |
| `ORGANIZATIONAL_SCOPE_DENIED` | 403 | Record outside assigned unit |
| `RECORD_NOT_ASSIGNED` | 403 | Required reviewer assignment missing |
| `FIELD_WRITE_DENIED` | 403 | Role cannot edit requested field group |
| `INVALID_WORKFLOW_TRANSITION` | 409 | Role/state action not allowed |
| `RESOURCE_VERSION_CONFLICT` | 409 | Resource changed before update |
| `FINAL_DECISION_RM_ONLY` | 403 | Only RM can approve/reject |

Return `404` instead of `403` when revealing that the resource exists would create an information-disclosure risk.

## 20. Acceptance Criteria

- Every authenticated user receives one or more explicit roles and organizational assignments.
- Customer/application queries are filtered by department and organizational scope.
- CDO cannot create or submit Progoti applications.
- CO cannot create or submit Dabi applications.
- BM can edit only BM-owned assessment/checklist fields.
- AM can edit only AM-owned fields and actions.
- Only RM can approve or reject.
- Invalid role/state transitions are rejected by the backend.
- Submitted historical versions cannot be edited.
- Correction creates a new version while preserving previous history.
- Nearby borrower response contains only approved summary fields.
- Raw media/storage keys and exact nearby coordinates are not directly accessible.
- Risk engine cannot perform workflow decisions.
- Business users cannot update/delete audit or workflow history.
- Return, additional verification and reject require remarks.
- Permission failures generate an audit/security event where appropriate.
- Automated authorization tests cover every role, state and critical endpoint.

