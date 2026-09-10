# Phase 2 delivery — Client assessments and scoring

Date: 2026-09-07. Implemented and deployed to the existing server at 138.252.125.117. This is a versioned demo scoring release, not an approved production lending model or completion of all remaining MVP phases.

## Delivered

- Fixed-point, decimal-safe five-category Client Score with approved 50/10/20/10/10 weights, higher-is-better direction, exact threshold tests and no missing-category reweighting.
- Separate append-only CDO/BM assessment revisions, persisted inputs/portfolio facts/category contributions/results/rule versions, latest complete BM canonical score and category comparison.
- Mandatory submission/recommendation guards for complete assessment, financial information, confirmed checklist, fresh server GPS and uploaded HOUSE evidence. An incomplete assessment has null total, not a favorable fallback.
- Database-backed demo-gps-v1: 100m maximum accuracy and 30-minute age; current CDO financial inputs must match the financial record used for its score.
- Immutable submission packages and immutable scoring rules. Additive migration 007; historical records are not rescored or overwritten.
- Mobile scoring input and comparison panels, BM evidence/GPS recapture, draft/returned-application resumption, and preserved form mounting during Back navigation. Web review displays both assessments; existing web CDO/BM paths have assessment editors.
- Legacy risk is labeled rather than shown as a new model score. Favorable Area Score UI fallbacks were removed; new Area scoring remains a later phase.

## Main changed locations

- packages/risk-engine/src/client-score.ts, client-score.test.ts, index.ts
- packages/validation/src/assessment.ts, index.ts
- apps/api/src/assessments.ts, module.ts
- database/migrations/007_client_assessments.sql
- apps/mobile/src/AssessmentPanel.tsx, api.ts, api.test.ts, App.tsx
- apps/mobile/app.json, android/app/build.gradle
- apps/web/scores.js, app.js, review.js, http.js
- scripts/e2e-smoke.mjs, phase1-integration.mjs, verify-deployment.mjs, deploy-phase2.sh
- doc/GeoCredit_AI_Demo_Client_Rules_v1.md and this report
- .gitignore excludes generated artifacts

The preceding Phase 1 changes were included in this coordinated rollout. No existing migration was rewritten, no production seed was run, and no Git push was performed.

## Verification

- npm.cmd test: 61/61 tests passed (44 API/workflow/web/mobile-client tests; 17 financial/client-score tests).
- npm.cmd run typecheck: passed. Web still requires visual/browser acceptance beyond syntax/helper tests.
- node scripts/phase1-integration.mjs: 10/10 real PostgreSQL/PostGIS integration groups passed, now extended for Phase 2. Covers incomplete submission, complete CDO->BM->AM->RM flow, 100m GPS, separate canonical scores, immutable records, forged portfolio inputs, concurrency and retries.
- Browser/script syntax checks and git diff --check passed.
- Local Gradle assembleRelease: BUILD SUCCESSFUL, 311 actionable tasks. No EAS/cloud build used.
- apksigner verify --verbose --print-certs: verified APK Signature Scheme v2; same existing signing certificate as the preceding APK.
- aapt: package com.geocredit.ai, version 0.2.0/code 3, minimum SDK 24, target SDK 36, launcher activity present. No debuggable flag in the release manifest.
- APK contains assets/index.android.bundle (1,262,380 bytes), the production host, and AssessmentPanel source in its generated source map. Hermes stores the demo-rule label as UTF-16; verified against that encoding rather than treating an absent UTF-8 literal as missing code.

## Production rollout

Backup: /opt/geocredit-backups/phase2-20260907T154355Z

The source archive and PostgreSQL custom-format dump were saved before changes; pg_restore --list validated the dump manifest. Migrations 006 and 007 were applied transactionally. Migration 006 recovered three existing reviewer claims from audit records; workflow statuses were not reset.

A temporary canary used the existing service configuration on a separate port. API/database/scoring module and available role read paths passed before service switch. The API, web and nginx services are active. Public login and scoped-list checks passed for CDO, BM, AM and RM. Production application count remained 48. No review action was executed against production records during acceptance.

Rollback support preserves the prior source archive; additive tables may remain if rolling code back. Database restoration is not an automatic rollback step and must not overwrite subsequent user activity.

## APK handoff

- Filename: GeoCredit-AI-0.2.0.apk
- Local path: E:\Hackathon\Team Arena\AI Credit Risk\artifacts\GeoCredit-AI-0.2.0.apk
- Download: http://138.252.125.117/downloads/GeoCredit-AI-0.2.0.apk
- Size: 70,367,016 bytes (70.37 MB)
- SHA-256: cfa8c6d2623090067e2324d256105a8912f2489346cd886826d97240f2266e02
- Signing certificate SHA-256: 8d548dc4cd6e0b56ec0ad7981fac7abb62d0e26ed14f7245647192953d01fbb5
- Existing keystore: apps/mobile/android/keystores/geocredit-release.jks; alias geocredit_release. Preserve it and the existing GEOCREDIT_KEYSTORE_PASSWORD / GEOCREDIT_KEY_PASSWORD secrets securely. No secrets were added to source.

Server artifact checksum matches the local artifact; download endpoint returns HTTP 200. Metro is not required for this bundled release.

## Remaining gates and scope

- No Android device was connected; physical installation, launch, camera/GPS and network acceptance remain unverified. The browser tool reported no available browser, and no Playwright/Puppeteer installation was available; visual browser acceptance is not claimed.
- The existing deployment uses HTTP and demo authentication configuration. It is not certified for real customer lending use. HTTPS and production authentication/security hardening remain necessary; rotate credentials previously shared in chat.
- New Area Score/cohort snapshots, maps, management aggregates, richer advisory generation, private member-image retrieval and the 20-customer 18-complete/2-incomplete scenario dataset are not part of Phase 2.
- Historical records remain legacy/incomplete where facts are missing. Legacy applications lacking a CDO submission package must return for correction before a new BM recommendation; no data was fabricated to bypass completeness.
- Demo portfolio normalization treats existing collection rows as schedule records. Approved ERP schedule mapping and production policy validation are still required.
