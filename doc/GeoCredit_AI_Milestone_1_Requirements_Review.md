# GeoCredit AI MVP — Requirements Review and Milestone 1 Plan

**Review date:** 2026-09-04  
**Review scope:** All 20 Markdown documents currently under `doc/`  
**Primary source of truth:** `Geo Credit AI PRD.md`

## 1. Document review result

The repository currently has a `doc/` directory, while the brief refers to `/docs`. I reviewed every Markdown file in `doc/`, including the PRD, architecture, technical requirements, database schema, API specification, workflow, role permissions, GPS/500m logic, risk scoring, prompt specification, UI specification, user flows, seed data, validation/error rules, security checklist, deployment guide, implementation plan, acceptance tests and demo story.

The documents are broadly consistent on the product boundary and agree that the first demonstrable slice is:

`CDO → customer/history → Dabi draft → financial assessment → GPS/image → 500m area intelligence → customer/area risk → BM → AM → RM decision → audit timeline`.

## 2. Consolidated requirements

### Product and platforms

- GeoCredit AI is decision support for microfinance lending, not an autonomous approval system.
- Android users are CDO, CO and BM. Web users are AM, RM and ADMIN.
- Dabi route: CDO → BM → AM → RM. Progoti route: CO → AM → RM.
- Only RM may approve or reject.
- The client sends workflow actions; the server derives and validates the next status.

### Foundation and data

- Use a TypeScript monorepo with React Native/Expo mobile, Next.js web, NestJS REST API, shared validation/types, PostgreSQL 16 + PostGIS, migrations and deterministic synthetic seed data.
- Use UUID identifiers, UTC timestamps, numeric/decimal money fields and `geography(Point,4326)` for verified locations.
- Keep customer/application versions, risk snapshots, workflow history, audit events and idempotency records append-only where specified.

### Authorization and integrity

Every protected request must re-check authentication, active account, role, department, organizational scope, assignment, current status, application version and idempotency where applicable. Access is deny-by-default; client-provided roles are never trusted.

Every mutation must use server-side validation, authorization and optimistic concurrency. Workflow transitions are atomic and auditable. Submitted application versions and risk snapshots are immutable; corrections create a new application version and risk snapshot.

### Geo and area intelligence

- Capture latitude, longitude, accuracy, capture time, image evidence, officer and application/customer binding.
- Server validation is authoritative; PostGIS point order is longitude then latitude.
- Nearby search uses `ST_DWithin` with exactly 500 metres, inclusive at 500m and exclusive beyond it. The applicant is excluded.
- Invalid, pending or ineligible locations are excluded. Bounding boxes may only prefilter.
- Area results expose aggregate intelligence and privacy-safe nearby summaries only; no nearby names, NID, phone, exact address, exact coordinates or full transaction history.
- Zero or insufficient cohorts are explicit non-low-risk outcomes. The suggested demo minimum cohort is 5.

### Risk and AI

- Customer Risk and Area Risk are separate deterministic scores, each 0–100, with versioned rules, thresholds, engine and feature schema.
- Default level mapping is LOW 0–24.99, MODERATE 25–49.99, HIGH 50–74.99 and VERY_HIGH 75–100.
- Scores, factors/reason codes and evidence references come from validated structured data, not the LLM.
- AI may generate an explainable narrative only. Its output is schema-validated and grounded; unsupported facts are rejected.
- A deterministic fallback report is required when AI fails.
- Reports always display: “AI Recommendation — Human Review Required”.
- AI/risk services cannot approve, reject or otherwise trigger lending workflow decisions.

### Offline and operational behavior

- Mobile may save drafts, GPS and media locally using SQLite; secrets/tokens use SecureStore.
- Local records are partitioned by authenticated user and show pending/synced/failed/conflict states.
- Client-generated UUIDs and stable idempotency keys prevent duplicate retries.
- Nearby search, risk generation and consequential workflow actions require online server confirmation.
- No local action may be presented as centrally submitted before synchronization.

## 3. Inconsistencies and open decisions

These are not resolved by the documents and should be confirmed before production-oriented implementation. They do not block a controlled demo foundation if configuration defaults are explicit and versioned.

1. **Documentation path:** brief says `/docs`; repository uses `/doc`. Keep `/doc` as the existing source location unless the repository layout is intentionally renamed.
2. **Scope of the first milestone:** the implementation plan describes a thin Dabi walking skeleton on Day 1, while the broader definition of done expects both journeys. Milestone 1 will implement the foundation plus a thin, real-API Dabi path; Progoti follows after the foundation is stable.
3. **GPS policy:** the GPS document suggests preferred accuracy ≤25m, warning 25–75m, poor >75m, a 30-second fix age, 30-second photo/fix tolerance and 24-hour evidence age, but says blocking is configurable. Demo configuration will block invalid coordinates and >75m accuracy, warn for 25–75m, and use the stated age defaults.
4. **Minimum area cohort:** documents call 5 a suggested demo value and leave the final value open. Use 5 in demo/test configuration and store it as a versioned setting.
5. **Risk governance:** documents provide default weights and boundaries but require business validation. Treat those defaults as `MVP_DEMO_V1`, not production policy.
6. **Image GPS semantics:** PRD wording can imply EXIF GPS, while architecture says device location metadata is trusted and EXIF is supporting evidence. Use server-bound device capture metadata as authoritative; retain EXIF only for comparison when available.
7. **BM wording:** the PRD sometimes says BM can “approve/recommend to AM”, but the workflow matrix defines BM’s action as `RECOMMEND` → `BM_RECOMMENDED`; only RM produces `APPROVED`/`REJECTED`. Implement the matrix.
8. **Identity and storage providers:** OIDC, object storage, map provider, source-system integration, retention/deletion, exact affordability/tolerance formula and reviewer assignment policy remain open. Use a guarded development auth adapter, private local object-storage adapter, seeded read model and configurable formulas for the MVP.

## 4. Milestone 1 goal

Establish a runnable, secure foundation where PostgreSQL/PostGIS is migrated and seeded, demo users can authenticate, role/scope checks are enforced by the API, shared contracts exist, and a thin Dabi application can be created and moved through its first server-validated workflow transition using real persistence.

## 5. Planned modules and files

```text
package.json / workspace config
.env.example / compose.yaml
apps/api/                  NestJS API, auth, guards, health, modules
apps/web/                  Next.js shell and role-aware demo entry point
apps/mobile/               Expo shell and development login entry point
packages/types/            shared IDs, roles, statuses, envelopes
packages/validation/       Zod request/response schemas
packages/workflow/         transition matrix and action contracts
packages/config/           environment and versioned MVP settings
database/migrations/       PostgreSQL/PostGIS schema migrations
database/seed/             deterministic users, org hierarchy and fixtures
tests/                     foundation unit/integration authorization tests
README.md                  setup and required command documentation
```

The exact framework configuration will follow the repository state discovered at implementation start; no application code currently exists in the workspace.

## 6. Milestone 1 task checklist

- [ ] Confirm Node/package-manager and Docker availability.
- [ ] Create workspace structure and strict TypeScript configuration.
- [ ] Add environment schema and safe `.env.example`; enforce `APP_ENV` guards.
- [ ] Add PostgreSQL/PostGIS Compose dependency and health checks.
- [ ] Create migration order for extensions, organization/users, customers, applications, versions, workflow/audit and idempotency.
- [ ] Add deterministic UUID seed users for CDO, CO, BM, AM, RM and ADMIN with branch/area/region scope.
- [ ] Add development authentication adapter that is unavailable in production mode.
- [ ] Implement API auth/session and current-user endpoints.
- [ ] Implement deny-by-default role, department, scope and assignment guards.
- [ ] Add shared response/error envelopes and validation schemas.
- [ ] Implement customer/application read skeleton and Dabi draft creation/update with optimistic version.
- [ ] Implement action-based first transition (`SUBMIT`) with server-derived status and append-only audit event.
- [ ] Add authorization, scope, version-conflict and idempotency tests.
- [ ] Add seed load, seed verification and smoke-test commands.
- [ ] Update README with install, dev, lint, typecheck, unit/integration/E2E, build, migration, seed, APK and deployment command placeholders/actuals.

## 7. Risks and controls

- **No existing repository code:** start with a walking skeleton and keep adapters replaceable.
- **Open business policy:** isolate demo defaults in configuration and label them non-production.
- **Cross-platform scope:** keep business rules in shared/backend packages; UI is not authoritative.
- **Sensitive data:** use synthetic seed data, redacted logs, private media adapter and privacy-safe nearby projections from the first schema/API pass.
- **Workflow bypass:** expose action names only and re-check state/role/scope/version in one transaction.

## 8. Milestone 1 exit criteria

- Database starts, migrates and verifies PostGIS.
- Seed load is deterministic and idempotent.
- Every demo role can authenticate only through the development adapter in non-production mode.
- Unauthorized role/scope/application access is denied by the API.
- A Dabi draft can be persisted, versioned and submitted through a valid action.
- Invalid action, stale version, duplicate idempotency key and non-authorized access have automated negative coverage.
- No production-readiness claim is made; unresolved policy decisions remain visible in configuration/documentation.

