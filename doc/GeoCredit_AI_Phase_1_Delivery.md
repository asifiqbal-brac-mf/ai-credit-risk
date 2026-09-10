# Phase 1 — correctness and workflow foundation

Date: 2026-09-07

Status: implemented locally; automated checks pass. Not deployed and not a claim of browser/device acceptance. Phase 2 has not started.

## Completed changes

- Web requests share JSON serialization and defensive response parsing. Same-origin API requests use the existing web proxy instead of silently stripping port 3000.
- GPS returns the actual, unchanged application version. Web no longer increments it locally; mobile preserves an explicitly supplied reviewer If-Match.
- Application detail and inbox responses expose backend-derived allowedActions. Mobile and both web review paths consume them.
- Only RM can finalize. RM opening the detail page records an internal START_REVIEW claim before exposing Approve/Reject. Final requests require confirmed=true and the current version; rejection/return remarks remain mandatory.
- Active account, department/product, organizational scope, creator ownership and reviewer assignment checks are enforced by shared workflow guards. Financial, GPS and checklist writes lock the application while checking authorization/state/version. Checklist type must match the actor role; GPS requires the actor's completed media.
- START_REVIEW sets reviewer_id atomically. Claimed applications remain in the claiming reviewer's inbox, not other reviewers' queues. Mobile refreshes its inbox after actions rather than unconditionally removing the item.
- Existing unassigned review-state records require an explicit audited claim. Creator ownership is preserved. No reassignment endpoint was added.
- Workflow retries bind actor/key to application, original If-Match, normalized action/remarks/confirmation. Replay is checked before stale-version rejection and returns the original result/version. Different payload/key reuse returns 409. Advisory transaction locks serialize simultaneous reuse; row locks serialize claims.
- Web retains uncertain transition keys in sessionStorage; mobile retains them for its current in-memory session. Successful business actions do not clear authentication. Logout clears application session/retry state and mobile financial inputs. Concurrent button submissions are guarded.
- Removed three seed UPDATE statements that reset existing application statuses. Existing applied migrations are unchanged.
- Fixed incorrect build entry paths for types, validation and risk-engine packages, discovered while exercising controller imports. No dependencies were upgraded. Tests resolve current workspace source rather than stale compiled copies.
- Preserved the CO/Progoti shared transition path without adding new Progoti UI/features.

## Changed files

Application and shared code:

- apps/api/src/module.ts
- packages/workflow/src/index.ts
- packages/validation/src/index.ts
- packages/types/package.json
- packages/validation/package.json
- packages/risk-engine/package.json
- apps/mobile/App.tsx
- apps/mobile/src/api.ts
- apps/web/app.js
- apps/web/review.js
- apps/web/http.js (new)

Database and verification:

- database/migrations/006_workflow_foundation.sql (new)
- database/seed/004_reviewer_demo.sql
- apps/api/vitest.config.ts (new)
- apps/api/src/workflow.test.ts
- apps/api/src/authorization.test.ts (new)
- apps/api/src/transitions.test.ts (new)
- apps/api/src/web-http.test.ts (new)
- apps/api/src/seed-safety.test.ts (new)
- apps/mobile/src/api.test.ts (new)
- scripts/e2e-smoke.mjs
- scripts/phase1-integration.mjs (new)
- doc/GeoCredit_AI_Scoring_Update_Analysis.md (existing untracked analysis record updated)
- doc/GeoCredit_AI_Phase_1_Delivery.md (this report)

## Database/API contract impact

- Migration 006 adds nullable applications.reviewer_id and workflow_actions.request_hash. It backfills only a claim supported by an existing START_REVIEW record at the current application version. It does not reset statuses or replace historical scores.
- Apply migration 006 before starting the updated API. It was applied and rerun only in disposable test databases, not the regular application database or production.
- Detail/inbox add allowedActions and reviewerId. Unauthorized clients must not invent fallback actions.
- POST transitions retains If-Match and Idempotency-Key. Final actions additionally require confirmed=true. Retries must retain the original version and payload, not the resulting version.
- Legacy workflow records without request hashes cannot be replayed as new requests; reuse fails safely with IDEMPOTENCY_CONFLICT.
- GPS response adds version. GPS does not advance the application lock version in this phase.
- Deploy API and clients together: old clients may send now-forbidden actions or omit confirmation.

## Commands and exact results

- npm.cmd test: PASS, 46/46 tests, zero failures (44 API/workflow/web/mobile-client tests plus 2 financial tests). Shared pretest builds passed.
- npm.cmd run typecheck: PASS for all workspaces. Existing web configuration still does not semantically check all browser JavaScript.
- node --check: PASS for apps/web/app.js, apps/web/review.js, apps/web/http.js, scripts/e2e-smoke.mjs and scripts/phase1-integration.mjs.
- git diff --check: PASS; Git emits existing LF/CRLF normalization warnings.
- node scripts/phase1-integration.mjs: PASS, 6/6 integration groups against real local PostgreSQL/PostGIS, including the API smoke flow.

Integration groups:

1. Migration application and rerun.
2. Seed rerun preserves a previously finalized application's status/version.
3. CDO submit -> BM claim/recommend -> AM claim/recommend -> RM internal claim/confirmed approval; final retry and timeline assertions.
4. Simultaneous claims yield one winner, one conflict and one audit record; original-request replay succeeds.
5. Claimed application stays in owner inbox and disappears from the competing reviewer's queue.
6. Assignment enforcement, non-RM final denial and payload-bound idempotency conflict.

The integration script creates a random, explicitly test-named local database and a temporary API on an available port. It removes only that database and stops its API in finally. Both executed test databases were removed; current application data was not modified. The smoke script now requires E2E_ALLOW_MUTATIONS=true and should only run against an isolated environment.

An intermediate test run exposed stale compiled workflow imports and invalid package entry paths; those were fixed. A subsequent typecheck exposed cross-platform test placement importing Expo through the API's Node compiler settings; the mobile test now lives under mobile and is included by the test runner. Final commands above passed without skipping tests.

## Remaining issues and release gates

- Full browser navigation, RM confirmation dialog and physical-device UX have not been exercised. The HTTP/client implementations have automated tests, not complete UI E2E coverage.
- No APK rebuilt, production deployment, Git commit or push performed.
- Normal API/web were not running during verification. Existing local PostgreSQL and MinIO were reachable; MinIO upload/download was not tested in this phase.
- Transition retry persistence on mobile lasts only for the running session; persistent offline recovery and general draft/upload idempotency remain future work.
- Seed scripts still contain demo-data updates unrelated to workflow state; do not seed production. A general migration ledger/seed lifecycle redesign is not included here.
- Existing scoring/area fallbacks, new scoring completeness guards, versioned GPS policy, immutable assessment snapshots, maps, private image delivery, management and AI features are deliberately not implemented in Phase 1.
- Vite reports its existing CommonJS Node API deprecation warning; dependencies were not upgraded to suppress it.

## Phase 2 readiness

The backend workflow foundation and isolated integration gate are ready. Complete browser/mobile acceptance and coordinate the additive migration/API/client rollout before calling Phase 1 release-ready. Phase 2 requires the next authorization; do not infer permission to implement scoring from this report.
