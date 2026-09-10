# GeoCredit AI scoring update — initial analysis and delivery checklist

Date: 2026-09-07

Status: **Phase 2 Client Scoring implemented and deployed; signed APK 0.2.0 delivered.** See [Phase 2 delivery report](GeoCredit_AI_Phase_2_Delivery.md) for verification and remaining gates. Area scoring, maps, management and richer AI implementation have not started. The baseline findings below describe the pre-implementation review, not current delivery status.

## Confirmed decisions

- Preserve the existing application and workspace structure.
- Mobile targets CDO/BM; responsive web targets AM/RM/Management.
- Client and Area Credit Scores use a higher-is-better scale. Do not reinterpret or overwrite historical risk snapshots that use another direction.
- Client weights: Income Source 50%, Social Acceptance 10%, Transaction History 20%, Savings 10%, House Infrastructure 10%.
- Versioned, visibly labeled demo normalization rules are authorized. They are not approved production credit policy.
- Synthetic dataset: 20 customers, 18 complete and 2 intentionally incomplete. Include high, medium, low and contrasting client/area results. Missing evidence must remain missing.
- Privacy conflict resolved by the user: authorized applicant details remain available; nearby members use anonymous references and privacy-permitted summaries, not names, photos, NIDs or member identifiers. Management receives protected aggregates only.
- Only RM records final approval/rejection. AI remains advisory.

## Review coverage and implementation gate

The documentation directory is `doc/`, not `docs/`. The complete first-party source and documentation review was finished and reported to the user. The user subsequently approved the analysis and authorized **Phase 1 only** in attachment `9406cf6a-69df-4a51-b37a-826b97c6fd2a`.

Reviewed sources include the supplied major-update request, security/privacy checklist, GPS/500m specification, prior scoring/workflow/coding review context, root README, workspace manifests, API controller/authentication/media implementation, shared domain/validation/workflow code, all five migration files, SQL runner, mobile API client, web review/static-server code and existing unit/E2E tests.

The remaining PRD, architecture, technical, database/API, UI, workflow, validation, prompt, seed, acceptance, demo and deployment documents were reviewed, together with mobile/native, web and deployment sources. The approved contract supersedes conflicting baseline suggestions. Existing applied migrations remain unchanged; Phase 1 uses an additive migration.

## Actual stack

- npm workspaces, TypeScript; Node v24.13.0 and npm v11.6.2 observed during baseline verification.
- Mobile: Expo `~57.0.19`, React `19.2.3`, React Native `0.86.3`; `apps/mobile/App.tsx` and `src/api.ts`; existing native Android project must be retained.
- Web: plain HTML/CSS/JavaScript served by `apps/web/server.mjs`. Do not migrate it to Next.js or create a separate application.
- API: NestJS 10, `pg`, Zod, shared workspace packages. Most application endpoints are in `apps/api/src/module.ts`.
- Persistence: PostgreSQL/PostGIS; numbered SQL files under `database/migrations` and `database/seed`.
- Media: AWS S3 SDK against MinIO, presigned PUT and completion endpoints.
- Authentication: isolated development login or HS256 bearer verification; active user lookup. Existing organizational checks require hardening, not replacement with a second auth system.
- Tests: Vitest in API and risk-engine workspaces; a separate API smoke script. No demonstrated mobile/browser E2E coverage yet.

## Verified implementation gaps

### Authoritative scores and snapshots

- `packages/risk-engine/src/index.ts` only calculates basic financial affordability. It does not implement the requested five-category score.
- Application detail currently constructs a separate financial-derived `riskScore` inline in the controller; it is not the requested versioned model.
- `apps/mobile/src/api.ts` substitutes `72` when the Area Credit Score is absent. `apps/web/review.js` also substitutes `72` and a `READY` outcome. These favorable defaults must be removed.
- No client-score/rule-version/cohort-member snapshot tables exist in the five reviewed migrations.
- Area recalculation currently uses an upsert that overwrites metrics for an application version. Submitted snapshots must instead remain immutable.

### Workflow and authorization

- `packages/workflow/src/index.ts` permits BM and AM to approve/reject from their own review states. This contradicts RM-only final decisions.
- The existing non-RM unit test checks AM approval only from `RM_REVIEW`; it misses the actual BM/AM authorization paths.
- Inbox filtering is region-only for non-admin roles; it needs branch/area/product/assignment restrictions and validated status filtering.
- Financial editing checks CDO role and DRAFT status but does not actually check `owner_id`, despite its error message claiming draft-owner enforcement.
- Checklist writes accept a client-selected checklist type without binding it to the authenticated role; separate BM assessment ownership must be enforced.
- Transition idempotency is checked after optimistic version validation and does not bind replay to the requested application/action/body. Lost-response retries require a safe, payload-bound replay contract.
- Workflow updates do not currently create a frozen application-version package or an immutable final-decision record.
- JWT expiry is optional in current verification. Production token validation needs explicit review before claiming production readiness.

### Spatial query and privacy

- Current query correctly uses geography `ST_DWithin(...,500)` and excludes the applicant.
- It lacks `LIMIT 10`, a stable tie-breaker, versioned freshness/eligibility rules and saved selected-member snapshots.
- Its anonymous-looking `reference` is actually `customers.customer_ref`; use query-local opaque aliases rather than exposing the underlying member reference.
- Small-cohort responses still contain rows and counts. Define and test suppression consistently, including management filters and complementary totals.
- GPS validation needs stronger application/media ownership and editable-state checks; a foreign key alone does not prove authorized completed evidence.
- New higher-is-better area averages must use compatible eligible snapshots. Do not mix legacy risk values with the new credit scores or silently relabel the legacy weighted area model.

### Clients, media and management

- Mobile request code overwrites an explicit reviewer `If-Match` header when an older draft is present.
- Web review maintains its own divergent workflow action matrix, including RM `START_REVIEW`/`RECOMMEND`. Return server-authorized actions to both clients.
- Private uploads exist, but the reviewed media controller has no authorized presigned GET endpoint for applicant images.
- Existing customer image URLs are not evidence that private-image access is enforced.
- Management role/scope, division hierarchy and aggregate reporting are absent from the reviewed schema/API. Do not give an aggregate-only management user ADMIN access as a shortcut.

## Proposed additive implementation sequence

### 1. Finish analysis, then shared domain and persistence

- Complete the review gate above and finalize versioned demo rubric inputs, thresholds, missing-data rules and area eligibility configuration.
- Extend existing `types`, `validation`, `risk-engine` and `workflow` packages; preserve the financial function where backward compatibility requires it.
- Use integer fixed-point arithmetic for normalized scores/weighted accumulation, with an explicit documented rounding policy; persist numeric values and the complete rule version.
- Represent incomplete score totals as null with reason codes, never zero or a favorable fallback. Keep raw facts, category explanations, weights and weighted contributions reproducible.
- Add new numbered migrations for rule definitions, role-owned assessments, immutable client snapshots, area snapshots and selected-member references, audit/final decisions and management hierarchy/permissions only where missing.
- Existing SQL runner reruns every SQL file and lacks a migration ledger or production seed guard. Add safe migration tracking/checksums and a production seed guard without editing applied SQL or resetting data.

### 2. Backend APIs and security

- Centralize reusable active-user, role/product, scope/assignment, state and version guards while preserving NestJS/error-envelope patterns.
- Extend authorized application details with client score, area score, quality status and allowed actions.
- Add application-scoped score recalculation/history, assessment comparison, nearby projection, map/GPS and advisory-report capabilities.
- Area selection: server-verified applicant GPS; inclusive 500m; eligible compatible snapshots; deterministic latest-snapshot/distance/stable-ID ordering; at most 10; versioned configurable minimum; persisted cohort.
- Generate anonymous references within the area snapshot. Do not return neighbor IDs, photos or exact coordinates. Keep map/list access behind the same authorization and cohort protections.
- Atomic final RM decision, expected version, idempotency, confirmation/remarks policy, audit and immutable decision record.
- Add private applicant-media viewing with short-lived authorized URLs. Never make a bucket public to satisfy image rendering.
- Management endpoints return filtered, scope-bound aggregates with small-cell and differencing protections; no member-detail or export route.

### 3. Mobile and web

- Reuse current styling/navigation; add focused reusable score/quality/area/advisory/comparison/map components within each existing platform.
- CDO/BM mobile: list to detail to assessment/evidence pages, retained inputs on Back, explicit loading/retry/empty/incomplete states.
- AM/RM web: actual detail-page navigation, server-provided permitted actions, preserved authenticated session and return to refreshed list after business actions.
- RM decision confirmation must identify the selected application and reviewed version.
- Management: Bangladesh-level filtered aggregate dashboard and accessible non-color-only summaries. No unnecessary new visualization framework.
- Always show `AI Recommendation — Human Review Required`; deterministic backend rules determine the classification. No AI authority over scores or decisions.

### 4. Synthetic fixtures and verification

- Add a clearly marked, non-production dataset without changing existing customer/application history.
- Assert exactly 20 scenario customers, 18 complete and 2 incomplete, spanning score bands and client/area contrasts. Add separate controlled spatial boundary fixtures as needed, distinguishing them from scenario customers.
- Test domain weights, decimal rounding, category reasons, every threshold boundary, missing inputs and determinism.
- Test PostGIS 499m/500m/501m, invalid/pending/stale exclusion, ties, maximum/minimum cohort and immutable snapshots against an isolated database.
- Test role/status matrix exhaustively, wrong department/scope/assignment, forged payloads, media authorization, management PII absence and replay/concurrency.
- Update existing API smoke expectations; add browser/mobile journey checks. Do not use real production applications as test approval targets.

## Impacted locations

- `packages/types/src/index.ts`: shared score, quality, assessment, map, advisory and role contracts.
- `packages/validation/src/index.ts`: validated raw assessments, filters and scoring requests.
- `packages/risk-engine/src/`: versioned demo normalization/aggregation and domain tests.
- `packages/workflow/src/index.ts`, `apps/api/src/workflow.test.ts`: RM-only final rules and exhaustive negative tests.
- `apps/api/src/module.ts`, `security.ts`, `media-controller.ts`: shared authorization, snapshot APIs, area query, private media and decisions.
- `database/migrations/`, `database/seed/`, `database/scripts/run-sql.ts`: additive schema, isolated synthetic fixtures and safe migration/seed execution.
- `apps/mobile/App.tsx`, `apps/mobile/src/api.ts`: screen components, backend score contracts, state/version handling.
- `apps/web/app.js`, `review.js`, HTML/CSS: list/detail review, shared display helpers and management views.
- `scripts/e2e-smoke.mjs`: current workflow assumptions and extended isolated tests.
- `doc/`: rubric/version, API/privacy changes and evidence-backed delivery reports.

## Baseline checks actually executed

- `npm.cmd test`: exit 0; API **4/4**, risk-engine **2/2**. Shared-package pretest builds succeeded. These six tests do not establish compliance with the new requirements.
- `npm.cmd run typecheck`: exit 0. Web workspace has `files: []`; this is not evidence of JavaScript/browser UI correctness.
- `npm.cmd run lint`: exit 0, but no workspace lint tasks ran. Lint coverage is absent, not passed validation.
- API smoke/E2E: **not run**. Static inspection shows RM `START_REVIEW`, which current workflow rejects; running it also creates/mutates database applications.
- PostGIS integration, browser/mobile screens, APK, production deployment: **not run or verified** in this step.

## Next work item

Complete browser/device acceptance for deployed APK 0.2.0, then plan the next authorized phase. The user explicitly authorized Phase 2 and production deployment in the subsequent conversation. Area scoring, maps and management remain future phases; do not describe them as complete.
