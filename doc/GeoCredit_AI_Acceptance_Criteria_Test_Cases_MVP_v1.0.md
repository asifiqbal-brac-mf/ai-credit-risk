# GeoCredit AI — Acceptance Criteria & Test Cases

**Version:** MVP v1.0  
**Status:** Draft for QA and UAT  
**Target:** Hackathon / 3-Day Demo MVP  
**Last Updated:** 03 September 2026

## 1. Purpose

This document defines product acceptance criteria and executable test cases for the GeoCredit AI MVP. It covers Dabi and Progoti application processing, customer and financial information, loan/savings history, field verification, GPS and 500-meter area intelligence, AI-assisted risk reporting, role permissions, workflow, offline behavior, security and auditability.

## 2. Scope

### In Scope

- Dabi workflow: `CDO → BM → AM → RM`
- Progoti workflow: `CO → AM → RM`
- Customer profile and historical loan/savings data
- Income, expense, liability, social and checklist assessments
- GPS and image evidence
- Borrower/portfolio intelligence within 500 meters
- Separate customer-risk and area-risk assessments
- Explainable AI report with human review
- Role, department and organizational-scope enforcement
- Draft/offline capture, sync, idempotency and conflict handling
- Workflow history, application versions and audit events

### Out of Scope

- Automated loan approval or rejection
- Production-calibrated credit policy/model validation
- Core banking disbursement or accounting posting
- Real biometric or national-ID verification
- General-purpose geographic search beyond the defined area analysis

## 3. Test Levels

| Level | Purpose | Owner |
|---|---|---|
| Unit | Calculations, validators, rules and transitions | Engineering |
| API/Integration | Database, PostGIS, storage, AI adapter and auth integration | Engineering/QA |
| UI/E2E | Role journeys and user-visible behavior | QA |
| UAT | Business process, wording and decision-support usefulness | Product/Business |
| Security | RBAC, privacy, upload and audit controls | Security/Engineering |

## 4. Entry Criteria

- Approved MVP build is deployed to the test environment.
- Database migrations and `GEOCREDIT_MVP_V1` seed dataset load successfully.
- Test users exist for CDO, CO, BM, AM, RM and ADMIN.
- Dabi and Progoti happy-path applications are available.
- GPS/PostGIS, image storage and AI adapter are reachable or approved mocks are configured.
- Active rule, prompt, threshold and feature-schema versions are recorded.
- Known limitations are documented.

## 5. Exit Criteria

- 100% of P0 and P1 cases executed.
- 100% of P0 cases passed.
- At least 95% of P1 cases passed; remaining failures have accepted workarounds and owners.
- No open Critical or High security/privacy defect.
- Both end-to-end approval routes pass.
- No role can approve/reject except RM.
- GPS 500m boundary and insufficient-data cases pass.
- AI report is advisory, explainable and linked to the current application version.
- Product, Business, QA and Engineering sign-off is recorded.

## 6. Severity and Priority

| Code | Meaning |
|---|---|
| P0 | Blocks core demo, approval route, security or data integrity |
| P1 | Major MVP behavior; workaround is limited |
| P2 | Important usability or secondary behavior |
| Critical | Security/privacy breach, data loss or unauthorized final decision |
| High | Core journey or calculation incorrect |
| Medium | Partial degradation with workaround |
| Low | Cosmetic or minor usability issue |

## 7. Global Acceptance Criteria

1. All displayed data must come from the authenticated user's allowed department and organizational scope.
2. The backend must revalidate permissions, workflow state and record version for every mutation.
3. Dabi and Progoti applications must follow their defined routes without skipping required reviewers.
4. Only RM may record `APPROVED` or `REJECTED`.
5. Submitted application versions and associated risk snapshots must remain immutable.
6. Corrections must create a new application version and, when relevant data changes, a new risk snapshot.
7. GPS coordinates must be server validated before submission.
8. The 500m calculation must use PostGIS/geodesic meter distance and include the exact 500m boundary.
9. Customer and area risk results must remain separate and show evidence/reason codes.
10. AI output must state `AI Recommendation — Human Review Required` and must not execute a workflow decision.
11. Offline retries must not create duplicate applications, evidence or workflow actions.
12. Sensitive data must be protected in transit, at rest, logs and API responses.
13. Material actions must create tamper-evident audit records.

## 8. Feature Acceptance Criteria

### AC-01 Authentication and Session

- Active users can sign in using the configured authentication provider.
- Inactive, expired or invalid identities are denied.
- Session expiry returns an authentication error without deleting unsynced local drafts.
- No password is stored in the GeoCredit application database.

### AC-02 Role and Organizational Scope

- CDO may create/submit Dabi applications only in assigned scope.
- CO may create/submit Progoti applications only in assigned scope.
- BM may review Dabi applications in assigned branch scope.
- AM may review assigned Dabi and Progoti applications in assigned area scope.
- RM may review and decide applications in assigned region scope.
- ADMIN cannot silently exercise RM credit-decision rights unless explicitly assigned the RM role under approved policy.

### AC-03 Customer Profile and History

- Authorized users can find a customer by allowed identifiers.
- Profile, loan and savings history are displayed chronologically and consistently.
- Sensitive identifiers are masked by default.
- Missing history is labeled as unavailable; it is not interpreted as good behavior.

### AC-04 Application Capture

- Required fields vary correctly between Dabi and Progoti.
- Money, date, duration and selection fields are validated on client and server.
- A draft can be saved incomplete.
- Submission is blocked until all mandatory guards pass.

### AC-05 Financial Assessment

- Income and expense totals are recalculated by the server.
- Available surplus and affordability ratios follow the approved rules.
- Negative or malformed amounts are rejected.
- Reviewer assessment differences are preserved and visibly flagged.

### AC-06 Checklist and Documents

- Required checklist questions are versioned by project and reviewer role.
- Mandatory missing documents block or warn according to configuration.
- `PRESENT`, `MISSING` and `NOT_APPLICABLE` are distinguishable.
- Remarks are required for configured adverse answers.

### AC-07 GPS and Image Evidence

- Capture records coordinates, accuracy, capture time and device/source metadata.
- Missing, stale, impossible or poor-accuracy locations are rejected or flagged by configured rules.
- Required house/business evidence is linked to the application and capture event.
- Unsupported, oversized or unsafe uploads are rejected.

### AC-08 500m Area Search

- Only eligible borrowers with valid server-confirmed locations are considered.
- Candidates at distances `≤ 500m` are included; candidates `> 500m` are excluded.
- Query origin, radius, rule version, execution time and borrower snapshot are stored.
- Personally identifying neighbor data is not exposed in the area summary.
- Cohorts below the configured minimum return `INSUFFICIENT_DATA` rather than a misleading score.

### AC-09 Risk Assessment

- The engine creates separate `CUSTOMER` and `AREA` assessments.
- Scores are within `0–100` and map to the configured risk bands.
- Outputs store rule/engine/threshold/feature versions and input snapshot reference.
- Positive factors, risk factors and missing-data indicators are evidence based.
- Rules are deterministic for identical versioned inputs.

### AC-10 AI Report

- Report output conforms to the prompt-output schema.
- Generated narrative does not invent data or contradict structured scores.
- Report includes key findings, positive factors, risk factors and suggested review actions.
- The human-review disclaimer is prominent.
- AI failure does not approve/reject or corrupt the application; retry/fallback is available.

### AC-11 Dabi Workflow

- Valid route is `DRAFT → SUBMITTED_BY_CDO → BM_REVIEW → BM_RECOMMENDED → AM_REVIEW → AM_RECOMMENDED → RM_REVIEW → APPROVED/REJECTED`.
- BM/AM may return or request additional verification with required remarks.
- Resubmission after correction follows the configured review path.
- Invalid transition attempts are rejected and audited.

### AC-12 Progoti Workflow

- Valid route is `DRAFT → SUBMITTED_BY_CO → AM_REVIEW → AM_RECOMMENDED → RM_REVIEW → APPROVED/REJECTED`.
- BM is not inserted into the Progoti route.
- AM may return or request additional verification with required remarks.
- Invalid transition attempts are rejected and audited.

### AC-13 Final Decision

- Only assigned/in-scope RM can approve or reject from `RM_REVIEW`.
- Rejection requires remarks; approval follows configured remark policy.
- Terminal applications are read-only except explicitly authorized administrative metadata.
- Final decisions record actor, time, application version and remarks.

### AC-14 Offline and Sync

- Users can save permitted drafts locally without connectivity.
- Sync resumes safely after reconnect.
- Idempotency keys prevent duplicate server mutations.
- Version conflicts are reported and never silently overwrite newer server data.
- Unsynced data remains visible to the originating authenticated user.

### AC-15 Audit and Observability

- Create, edit, submit, transition, decision, geo verification and risk generation are audited.
- Audit events include actor/service, action, target, result and timestamp.
- Sensitive field values and image bytes are absent from logs.
- Correlation IDs connect UI/API/risk processing diagnostics.

## 9. Test Data References

Use the `GEOCREDIT_MVP_V1` dataset from the Seed/Mock Data Specification. Key references:

| Fixture | Use |
|---|---|
| `DABI-SEED-001` | Complete Dabi draft / low risk |
| `DABI-SEED-003` | BM review / high risk |
| `DABI-SEED-006` | RM queue candidate |
| `PRO-SEED-001` | Complete Progoti draft / low risk |
| `PRO-SEED-003` | AM review / high risk |
| `PRO-SEED-005` | RM review / very-high risk |
| `GEO-EDGE-499/500/501` | Radius boundary validation |
| `AREA-INSUFFICIENT` | Minimum cohort behavior |
| `FIN-STRONG/NEGATIVE` | Affordability extremes |

## 10. Functional Test Cases

### Authentication and Access

| ID | Pri. | Scenario / Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-AUTH-001 | P0 | Active CDO account | Sign in with valid identity | Session created; Dabi authorized landing page shown |
| TC-AUTH-002 | P0 | Inactive account | Attempt sign-in | Access denied; no application data returned |
| TC-AUTH-003 | P1 | Expired session and unsynced draft | Trigger API call, then re-authenticate | `401`; draft retained locally; sync possible after login |
| TC-RBAC-001 | P0 | CDO logged in | Attempt to create Progoti application via API | `403 ROLE_PERMISSION_DENIED`; audit denial |
| TC-RBAC-002 | P0 | CO logged in | Attempt to create Dabi application | `403 ROLE_PERMISSION_DENIED` |
| TC-RBAC-003 | P0 | BM-02 and Branch-01 application | Open/review application | Scope denied; sensitive payload not returned |
| TC-RBAC-004 | P0 | AM assigned to area | Open Dabi and Progoti AM queues | Only in-scope assigned records displayed |
| TC-RBAC-005 | P0 | Non-RM role | Call approve/reject endpoint | `403`; state unchanged; denial audited |

### Customer and Application Capture

| ID | Pri. | Scenario / Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-CUS-001 | P1 | Allowed customer exists | Search by member number | Correct masked profile returned |
| TC-CUS-002 | P1 | Out-of-scope customer exists | Search exact member number | No unauthorized data disclosed |
| TC-CUS-003 | P1 | Customer with no history | Open history tab | Clear `No history available`; no positive inference |
| TC-APP-001 | P0 | CDO and Dabi customer | Create draft and save partial data | Draft saved; missing fields identified but do not block save |
| TC-APP-002 | P0 | CO and Progoti customer | Create full Progoti draft | Project-specific fields/checklists displayed and saved |
| TC-APP-003 | P1 | Draft with invalid negative expense | Save/submit | Server rejects invalid amount with field error |
| TC-APP-004 | P1 | Two updates use same record version | Save first, then second stale update | Second update returns `RESOURCE_VERSION_CONFLICT` |
| TC-APP-005 | P0 | Missing mandatory geo/image | Submit application | Submission blocked with actionable validation message |

### Financial, Checklist and Documents

| ID | Pri. | Scenario / Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-FIN-001 | P0 | `FIN-STRONG` fixture | Save line items and request calculation | Totals, surplus and ratios match rule calculation |
| TC-FIN-002 | P0 | Expense exceeds income | Calculate assessment | Non-positive surplus and risk indicator produced; no divide-by-zero |
| TC-FIN-003 | P1 | Debt balance but no monthly payment | Calculate | Balance is not treated as monthly payment; missing monthly data flagged |
| TC-FIN-004 | P1 | CDO/BM values differ | BM saves assessment | Both versions retained; difference warning shown |
| TC-CHK-001 | P1 | Mandatory answer missing | Submit/recommend | Action blocked; exact question identified |
| TC-CHK-002 | P1 | Adverse answer requiring remarks | Save without remarks | Validation error; save succeeds after remarks supplied |
| TC-DOC-001 | P1 | Mandatory document `MISSING` | Submit | Block or warning matches active configuration |
| TC-DOC-002 | P2 | Document `NOT_APPLICABLE` | View checklist | State shown separately from missing |

### GPS, Evidence and Area Intelligence

| ID | Pri. | Scenario / Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-GEO-001 | P0 | Valid coordinate and acceptable accuracy | Capture, upload and verify | Geo status becomes `VALID`; metadata stored |
| TC-GEO-002 | P0 | Location absent | Attempt submit | `GEO_LOCATION_REQUIRED`; state remains draft |
| TC-GEO-003 | P1 | Accuracy worse than configured limit | Verify capture | Status `INVALID`; retake instruction shown |
| TC-GEO-004 | P1 | Stale capture time | Verify capture | Rejected/flagged per configuration; cannot masquerade as live capture |
| TC-GEO-005 | P0 | `GEO-EDGE-499` | Run area search | Candidate included; calculated distance near 499m |
| TC-GEO-006 | P0 | `GEO-EDGE-500` | Run area search | Candidate included because boundary is inclusive |
| TC-GEO-007 | P0 | `GEO-OUT-501` | Run area search | Candidate excluded |
| TC-GEO-008 | P1 | Candidate has invalid/pending geo | Run area search | Candidate excluded from eligible cohort |
| TC-GEO-009 | P0 | Cohort below configured minimum | Generate area assessment | `INSUFFICIENT_DATA`; no misleading numeric classification |
| TC-GEO-010 | P1 | Valid cohort | Inspect API/UI response | Aggregate metrics only; neighbor PII absent |
| TC-MEDIA-001 | P1 | Supported image below limit | Upload | Object stored; checksum and application link recorded |
| TC-MEDIA-002 | P0 | Executable/unsupported MIME | Upload disguised file | Rejected; no public object created |
| TC-MEDIA-003 | P1 | File exceeds size limit | Upload | Rejected with safe size error |

### Risk and AI Report

| ID | Pri. | Scenario / Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| TC-RISK-001 | P0 | Identical snapshot/rule versions | Score twice | Same customer and area scores/factors returned |
| TC-RISK-002 | P0 | Score at each threshold boundary | Calculate level | Correct LOW/MODERATE/HIGH/VERY_HIGH mapping |
| TC-RISK-003 | P0 | Strong applicant, risky area | Generate assessment | Customer LOW and Area HIGH remain separate |
| TC-RISK-004 | P1 | New borrower/no history | Score customer | Missing-data code included; not treated as clean history |
| TC-RISK-005 | P1 | Source data changes after submission | View frozen report | Submitted snapshot/report unchanged |
| TC-RISK-006 | P0 | Correction changes financial/geo data | Resubmit | New application version and new linked risk snapshot created |
| TC-AI-001 | P0 | Valid risk inputs | Generate report | Schema valid; factors/evidence consistent; disclaimer visible |
| TC-AI-002 | P0 | Prompt response invents unsupported fact | Validate output | Output rejected/fallback used; hallucinated claim not displayed |
| TC-AI-003 | P0 | AI provider unavailable | Generate/refresh report | Safe error/retry; application not approved/rejected or corrupted |
| TC-AI-004 | P1 | Malformed JSON response | Process response | Schema validation fails; retry/fallback event logged |
| TC-AI-005 | P0 | User requests AI to approve | Exercise UI/API | AI cannot transition workflow; human review remains required |

## 11. Workflow Test Cases

### Dabi

| ID | Pri. | From / Actor | Action | Expected Result |
|---|---|---|---|---|
| TC-WF-D-001 | P0 | DRAFT / CDO | Submit complete Dabi application | `SUBMITTED_BY_CDO`; BM queue owner assigned |
| TC-WF-D-002 | P0 | SUBMITTED_BY_CDO / BM | Start review | `BM_REVIEW`; assigned BM recorded |
| TC-WF-D-003 | P0 | BM_REVIEW / BM | Recommend with complete assessment | `BM_RECOMMENDED`; AM queue assignment created |
| TC-WF-D-004 | P0 | BM_RECOMMENDED / AM | Start and recommend | `AM_RECOMMENDED`; RM queue assignment created |
| TC-WF-D-005 | P0 | AM_RECOMMENDED / RM | Start review and approve | `APPROVED`; decision actor/time/version recorded |
| TC-WF-D-006 | P0 | RM_REVIEW / RM | Reject without remarks | Blocked; succeeds only after remarks supplied |
| TC-WF-D-007 | P1 | BM_REVIEW / BM | Return with reason | `RETURNED_FOR_CORRECTION`; assigned to CDO |
| TC-WF-D-008 | P1 | AM_REVIEW / AM | Request additional verification | Required reason/assignee; status updated and audited |
| TC-WF-D-009 | P0 | DRAFT / CDO | Attempt direct AM/RM status | `INVALID_WORKFLOW_TRANSITION`; state unchanged |

### Progoti

| ID | Pri. | From / Actor | Action | Expected Result |
|---|---|---|---|---|
| TC-WF-P-001 | P0 | DRAFT / CO | Submit complete Progoti application | `SUBMITTED_BY_CO`; AM queue owner assigned |
| TC-WF-P-002 | P0 | SUBMITTED_BY_CO / AM | Start review | `AM_REVIEW`; assigned AM recorded |
| TC-WF-P-003 | P0 | AM_REVIEW / AM | Recommend | `AM_RECOMMENDED`; RM queue assignment created |
| TC-WF-P-004 | P0 | AM_RECOMMENDED / RM | Start and approve | `APPROVED`; immutable final decision stored |
| TC-WF-P-005 | P1 | AM_REVIEW / AM | Return with remarks | `RETURNED_FOR_CORRECTION`; assigned to CO |
| TC-WF-P-006 | P0 | SUBMITTED_BY_CO / BM | Attempt review | Denied; BM not part of Progoti route |

### Correction, Concurrency and Terminal State

| ID | Pri. | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| TC-WF-C-001 | P0 | Returned application corrected | Edit, regenerate risk, resubmit | New version; valid resubmission route and audit chain |
| TC-WF-C-002 | P1 | Additional verification completed | Upload new geo/image, submit | New evidence/version linked; prior evidence retained |
| TC-WF-C-003 | P0 | Duplicate transition request | Retry same idempotency key | Single transition/audit success record |
| TC-WF-C-004 | P0 | Two reviewers act on same version | Submit actions concurrently | One succeeds; stale action conflicts |
| TC-WF-C-005 | P0 | Approved application | Attempt business-data edit | Rejected; terminal state unchanged |

## 12. Offline and Sync Test Cases

| ID | Pri. | Scenario | Steps | Expected Result |
|---|---|---|---|---|
| TC-OFF-001 | P1 | No network | Create and save draft | Draft available locally with unsynced indicator |
| TC-OFF-002 | P0 | Network restored | Sync offline draft | One server record created; local/server IDs correlated |
| TC-OFF-003 | P0 | Response lost after server success | Retry same request/idempotency key | Existing result returned; no duplicate |
| TC-OFF-004 | P0 | Server changed since offline edit | Sync stale version | Conflict shown; no silent overwrite |
| TC-OFF-005 | P1 | Form synced, image still pending | Attempt submit | Submission blocked until evidence is ready |
| TC-OFF-006 | P1 | GPS captured offline | Reconnect and sync | `LOCAL_ONLY/UPLOAD_PENDING` progresses to server validation |
| TC-OFF-007 | P0 | User signs out with local draft | Sign in as different user | Second user cannot access first user's draft |

## 13. API and Data Integrity Test Cases

| ID | Pri. | Scenario | Expected Result |
|---|---|---|---|
| TC-API-001 | P0 | Invalid UUID/path identifier | Safe `400/404`; no stack trace |
| TC-API-002 | P1 | Unsupported content type | `415` with documented error envelope |
| TC-API-003 | P1 | Request repeated with same key/same payload | Same logical result, no duplicate |
| TC-API-004 | P0 | Same idempotency key/different payload | Conflict/reuse error; no mutation |
| TC-API-005 | P1 | Queue pagination/sorting | Stable order; no missing/duplicated records between pages |
| TC-DB-001 | P0 | Application is approved/rejected | Decision timestamp and actor are non-null |
| TC-DB-002 | P0 | Risk snapshot created | References existing application version and feature set |
| TC-DB-003 | P0 | Savings transactions loaded | Running balances reconcile |
| TC-DB-004 | P0 | Workflow action committed | Status update and history insert are atomic |
| TC-DB-005 | P1 | Soft-deleted customer | Excluded from normal searches and new applications |

## 14. Security and Privacy Test Cases

| ID | Pri. | Scenario | Expected Result |
|---|---|---|---|
| TC-SEC-001 | P0 | Modify role/customer/application ID in request | Authorization rechecked; access denied |
| TC-SEC-002 | P0 | SQL injection payload in search/input | Parameterized handling; no data exposure/mutation |
| TC-SEC-003 | P0 | Stored/reflected script in remarks | Encoded/sanitized; script never executes |
| TC-SEC-004 | P0 | Direct object-storage URL guess | Private object remains inaccessible without authorization |
| TC-SEC-005 | P0 | Inspect logs after sensitive operations | No full ID, token, coordinates where prohibited, or image bytes |
| TC-SEC-006 | P1 | Export/display customer identifier | Masked according to role/policy |
| TC-SEC-007 | P0 | Replay expired/forged token | Denied and safely logged |
| TC-SEC-008 | P1 | Excessive repeated requests | Rate/control policy applied without data corruption |
| TC-SEC-009 | P0 | Audit record update/delete through normal API | Operation unavailable/denied |

## 15. Performance and Reliability Test Cases

The exact service-level targets must be confirmed by Engineering/Product. MVP defaults:

| ID | Pri. | Operation / Load | Provisional Acceptance |
|---|---|---|---|
| TC-PERF-001 | P1 | Customer/application detail | p95 API response ≤ 2 seconds excluding image bytes |
| TC-PERF-002 | P1 | Queue list, normal seeded volume | p95 ≤ 2 seconds |
| TC-PERF-003 | P0 | 500m PostGIS query with expected demo volume | p95 ≤ 3 seconds |
| TC-PERF-004 | P1 | Risk rule calculation excluding external AI | p95 ≤ 3 seconds |
| TC-PERF-005 | P1 | AI narrative generation | Completes within configured timeout or cleanly falls back |
| TC-REL-001 | P0 | Risk service times out | No partial assessment marked complete; safe retry possible |
| TC-REL-002 | P0 | Workflow DB operation fails mid-transaction | Status/history remain consistent after rollback |

## 16. Compatibility and Accessibility Checks

| ID | Pri. | Check | Expected Result |
|---|---|---|---|
| TC-UX-001 | P1 | Supported Android/mobile viewport | Core field workflow usable without horizontal scrolling |
| TC-UX-002 | P1 | Required field error | Error is near field, specific and keyboard reachable |
| TC-UX-003 | P2 | Keyboard-only web navigation | Logical focus order and visible focus |
| TC-UX-004 | P2 | Screen-reader labels | Inputs, buttons, risk levels and status have accessible names |
| TC-UX-005 | P1 | Risk color display | Meaning also conveyed by text/icon; not color only |
| TC-UX-006 | P1 | Slow/failed network | Loading, retry and unsynced states clearly shown |

## 17. End-to-End UAT Scenarios

### UAT-01 Dabi Low-Risk Approval

**Actors:** CDO, BM, AM, RM  
**Data:** Clean repeat borrower, strong financials, valid geo/image, low-risk area.

1. CDO creates and completes the Dabi application.
2. System generates separate customer and area risk results.
3. CDO acknowledges AI report and submits.
4. BM reviews assessment/checklist and recommends.
5. AM reviews frozen snapshot and recommends.
6. RM reviews evidence and approves.

**Expected:** Valid transition chain, immutable versions, clear evidence, final decision attributed only to RM.

### UAT-02 Dabi Return and Correction

**Actors:** CDO, BM  
**Data:** Missing/incorrect financial detail.

1. CDO submits.
2. BM returns with reason and remarks.
3. CDO corrects data and resubmits.

**Expected:** Prior version retained; new version/risk snapshot created; complete audit chain visible.

### UAT-03 Progoti High-Risk Rejection

**Actors:** CO, AM, RM  
**Data:** Weak cash flow, external debt, severe overdue, risky area.

1. CO submits the complete Progoti assessment.
2. AM reviews, records comments and recommends onward.
3. RM reviews customer/area evidence and rejects with remarks.

**Expected:** AI remains advisory; RM owns decision; no BM stage; rejection is read-only and audited.

### UAT-04 GPS Retake and Area Insufficiency

**Actors:** CO, AM  
**Data:** Poor-accuracy first capture and fewer than five eligible nearby borrowers.

1. Initial geo verification fails.
2. CO retakes GPS and image; verification succeeds.
3. Area search returns insufficient data.
4. CO completes other guards and submits according to configured policy.

**Expected:** Invalid location excluded; replacement evidence retained; insufficient data clearly distinguished from low risk.

### UAT-05 Offline Draft and Conflict

**Actors:** Field officer  
**Data:** Draft edited offline while a newer server version exists.

1. User edits locally without network.
2. Network returns and sync begins.
3. Server detects stale version.

**Expected:** No overwrite or duplicate; conflict is actionable; local data remains recoverable.

## 18. Requirements Traceability Matrix

| Requirement Area | Acceptance Criteria | Primary Test Cases |
|---|---|---|
| Dabi journey | AC-04, AC-11, AC-13 | TC-WF-D-001–009, UAT-01/02 |
| Progoti journey | AC-04, AC-12, AC-13 | TC-WF-P-001–006, UAT-03 |
| Customer/history | AC-03 | TC-CUS-001–003 |
| Financial/checklist | AC-05, AC-06 | TC-FIN-001–004, TC-CHK-001–002 |
| GPS/image | AC-07 | TC-GEO-001–004, TC-MEDIA-001–003 |
| 500m intelligence | AC-08 | TC-GEO-005–010, UAT-04 |
| Risk/AI | AC-09, AC-10 | TC-RISK-001–006, TC-AI-001–005 |
| RBAC | AC-01, AC-02 | TC-AUTH/RBAC/SEC cases |
| Offline/sync | AC-14 | TC-OFF-001–007, UAT-05 |
| Auditability | AC-15 | Workflow, DB and SEC cases |

## 19. Test Execution Record Template

| Field | Value |
|---|---|
| Test Case ID | |
| Build/Commit | |
| Environment | |
| Dataset Version | |
| Tester | |
| Execution Date | |
| Result | PASS / FAIL / BLOCKED / NOT RUN |
| Actual Result | |
| Evidence Link | |
| Defect ID | |
| Notes | |

## 20. Defect Rules

- A failed P0 case blocks release/demo sign-off unless fixed and retested.
- Permission bypass, unauthorized decision, PII leakage or corrupt workflow history is Critical.
- Calculation/risk-band mismatch and incorrect 500m inclusion are High.
- Every defect must include build, environment, fixture, steps, expected/actual result and evidence.
- Fixed defects require targeted retest and relevant regression tests.

## 21. UAT Sign-Off Template

| Role | Name | Decision | Date | Remarks |
|---|---|---|---|---|
| Product Owner | | Approve / Conditional / Reject | | |
| Dabi Business Representative | | Approve / Conditional / Reject | | |
| Progoti Business Representative | | Approve / Conditional / Reject | | |
| Credit Risk Representative | | Approve / Conditional / Reject | | |
| QA Lead | | Approve / Conditional / Reject | | |
| Engineering Lead | | Approve / Conditional / Reject | | |
| Security/Privacy Reviewer | | Approve / Conditional / Reject | | |

## 22. MVP Acceptance Decision

The MVP is accepted only when the exit criteria are met and authorized signatories confirm that:

- both business workflows operate correctly;
- user access is properly scoped;
- customer and area risk outputs are understandable and advisory;
- GPS/500m behavior is accurate;
- no known Critical/High security or data-integrity issue remains; and
- limitations of demo rules, data and AI output are clearly communicated.

