# GeoCredit AI — Environment & Deployment Guide

**Version:** MVP v1.0  
**Status:** Development and Demo Guide  
**Target:** Hackathon / 3-Day MVP  
**Last Updated:** 03 September 2026

## 1. Purpose

This guide defines how to configure, run, build, deploy, verify and recover the GeoCredit AI MVP across local, CI/test, demo/UAT and production-like environments.

Commands and service names are reference conventions. Adapt them to the selected repository while preserving the security, migration, rollback and verification requirements in this document.

## 2. Reference Architecture

```mermaid
flowchart TD
    U[Web or Mobile Browser] --> W[Web Application]
    W --> A[Backend API]
    A --> D[(PostgreSQL and PostGIS)]
    A --> O[Private Object Storage]
    A --> Q[Job or Task Adapter]
    Q --> R[Risk Rules and AI Report]
    A --> I[Identity Provider]
```

For the 3-day MVP, the web and API layers may run in one deployable application. Database, object storage and authentication must remain behind adapters so demo implementations can later be replaced.

## 3. Environment Matrix

| Environment | Purpose | Data | Access | Deployment |
|---|---|---|---|---|
| Local | Development and debugging | Synthetic seed | Developer machine | Manual/container |
| CI/Test | Automated checks | Disposable synthetic | CI only | Per pipeline/run |
| Demo | Hackathon demonstration | Curated synthetic | Restricted team/demo users | Manual approval |
| UAT | Business validation | Synthetic or approved masked | Named testers | Controlled release |
| Production | Future live use | Approved live data | Enterprise controls | Formal release process |

The MVP must never automatically load seed data in production.

## 4. Software Prerequisites

### Required

| Dependency | Recommended Version | Verification |
|---|---:|---|
| Node.js | 22 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| PostgreSQL | 16 | `psql --version` |
| PostGIS | 3.4+ | Query extension version |
| Docker/Compose | Current supported | `docker compose version` |
| Git | 2.40+ | `git --version` |

### Optional

- Object-storage CLI for bucket inspection.
- Managed deployment CLI for the selected platform.
- Android device or mobile browser for GPS/camera testing.
- API client for exploratory tests.

## 5. Suggested Repository Structure

```text
geocredit-ai/
  apps/
    web/
    api/
  packages/
    domain/
    validation/
    risk-engine/
    ui/
  database/
    migrations/
    seed/
  tests/
    unit/
    integration/
    e2e/
  infra/
    docker/
    deploy/
  docs/
  .env.example
  compose.yaml
  package.json
```

A single-app structure is acceptable for the MVP if domain, database, risk and AI concerns remain logically separated.

## 6. Configuration Principles

- Validate all required configuration at application startup.
- Store secrets outside source control.
- Use separate credentials for every environment.
- Never expose server-only values through public/browser-prefixed variables.
- Use UTC for storage and `Asia/Dhaka` only for intended display.
- Pin risk-rule, prompt and schema versions.
- Make demo-only authentication/role switching impossible when `APP_ENV=production`.
- Do not log configuration secrets or full connection URLs.

## 7. Environment Variables

### 7.1 Application

| Variable | Required | Example/Meaning |
|---|---|---|
| `APP_ENV` | Yes | `local`, `test`, `demo`, `uat`, `production` |
| `APP_NAME` | Yes | `GeoCredit AI` |
| `APP_BASE_URL` | Yes | Public web origin |
| `API_BASE_URL` | Yes | Server API origin or internal URL |
| `LOG_LEVEL` | Yes | `debug` local; `info` demo/UAT |
| `LOG_FORMAT` | No | `pretty` local; `json` deployed |
| `TZ` | Yes | `UTC` for server process |
| `DISPLAY_TIMEZONE` | Yes | `Asia/Dhaka` |
| `BUILD_VERSION` | Yes deployed | Commit SHA or release tag |

### 7.2 Database

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_POOL_MIN` | No | Minimum pool size |
| `DATABASE_POOL_MAX` | Yes | Maximum pool size |
| `DATABASE_SSL_MODE` | Deployed | `require`/platform equivalent |
| `DATABASE_STATEMENT_TIMEOUT_MS` | Yes | Query timeout |
| `MIGRATION_DATABASE_URL` | Recommended | Elevated migration-only connection |

### 7.3 Authentication

| Variable | Required | Meaning |
|---|---|---|
| `AUTH_PROVIDER` | Yes | `development`, `oidc` or approved provider |
| `AUTH_ISSUER_URL` | OIDC | Token issuer |
| `AUTH_CLIENT_ID` | OIDC | Application client ID |
| `AUTH_CLIENT_SECRET` | Server/OIDC | Secret stored in secret manager |
| `AUTH_AUDIENCE` | OIDC | Expected token audience |
| `AUTH_SESSION_SECRET` | Yes | Strong session signing/encryption key |
| `DEMO_ROLE_SWITCHER_ENABLED` | Demo only | Must be `false` in UAT/production |

### 7.4 Object Storage and Media

| Variable | Required | Meaning |
|---|---|---|
| `OBJECT_STORAGE_ENDPOINT` | Adapter dependent | Private storage endpoint |
| `OBJECT_STORAGE_BUCKET` | Yes | Environment-specific bucket |
| `OBJECT_STORAGE_REGION` | Provider dependent | Region |
| `OBJECT_STORAGE_ACCESS_KEY` | Server only | Secret credential |
| `OBJECT_STORAGE_SECRET_KEY` | Server only | Secret credential |
| `MEDIA_MAX_SIZE_MB` | Yes | Approved image-size limit |
| `MEDIA_ALLOWED_MIME_TYPES` | Yes | Example: `image/jpeg,image/png,image/webp` |
| `SIGNED_URL_TTL_SECONDS` | Yes | Short download/upload validity |

### 7.5 GPS and Area Search

| Variable | Required | MVP Default |
|---|---|---:|
| `GEO_RADIUS_METERS` | Yes | `500` |
| `GEO_MAX_ACCURACY_METERS` | Yes | Business-approved limit; demo e.g. `100` |
| `GEO_MAX_CAPTURE_AGE_MINUTES` | Yes | Demo e.g. `30` |
| `AREA_MINIMUM_COHORT` | Yes | `5` |
| `AREA_RULE_VERSION` | Yes | `area-mvp-1.0` |

The application must not accept a client override of the authoritative search radius or eligibility rules.

### 7.6 Risk and AI

| Variable | Required | Meaning |
|---|---|---|
| `RISK_ENGINE_VERSION` | Yes | `rules-mvp-1.0` |
| `RISK_THRESHOLD_VERSION` | Yes | `thresholds-mvp-1.0` |
| `FEATURE_SCHEMA_VERSION` | Yes | `features-mvp-1.0` |
| `AI_PROVIDER` | Yes | `mock`, approved provider |
| `AI_API_KEY` | Provider | Secret; server only |
| `AI_MODEL` | Provider | Approved model deployment |
| `AI_PROMPT_VERSION` | Yes | `prompt-mvp-1.0` |
| `AI_TIMEOUT_MS` | Yes | Provider timeout |
| `AI_MAX_RETRIES` | Yes | Small bounded value |
| `AI_FALLBACK_ENABLED` | Yes | `true` for demo resilience |

### 7.7 Offline, Security and Operations

| Variable | Required | Meaning |
|---|---|---|
| `IDEMPOTENCY_TTL_HOURS` | Yes | Retention for mutation keys |
| `CORS_ALLOWED_ORIGINS` | Deployed | Exact allowed origins |
| `RATE_LIMIT_ENABLED` | Yes | Enable API control |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Yes | Approved threshold |
| `SENTRY_DSN` or equivalent | Optional | Error reporting endpoint |
| `OTEL_EXPORTER_ENDPOINT` | Optional | Telemetry destination |
| `AUDIT_LOG_ENABLED` | Yes | Must be `true` deployed |
| `ALLOW_SYNTHETIC_SEED` | Local/demo only | Explicit seed safety switch |

## 8. Safe `.env.example`

```dotenv
APP_ENV=local
APP_NAME=GeoCredit AI
APP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
LOG_LEVEL=debug
LOG_FORMAT=pretty
TZ=UTC
DISPLAY_TIMEZONE=Asia/Dhaka

DATABASE_URL=postgresql://geocredit_local:change_me@localhost:5432/geocredit_local
DATABASE_POOL_MAX=10
DATABASE_SSL_MODE=disable
DATABASE_STATEMENT_TIMEOUT_MS=10000

AUTH_PROVIDER=development
AUTH_SESSION_SECRET=replace_with_long_random_value
DEMO_ROLE_SWITCHER_ENABLED=true

OBJECT_STORAGE_BUCKET=geocredit-local
MEDIA_MAX_SIZE_MB=10
MEDIA_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
SIGNED_URL_TTL_SECONDS=300

GEO_RADIUS_METERS=500
GEO_MAX_ACCURACY_METERS=100
GEO_MAX_CAPTURE_AGE_MINUTES=30
AREA_MINIMUM_COHORT=5
AREA_RULE_VERSION=area-mvp-1.0

RISK_ENGINE_VERSION=rules-mvp-1.0
RISK_THRESHOLD_VERSION=thresholds-mvp-1.0
FEATURE_SCHEMA_VERSION=features-mvp-1.0
AI_PROVIDER=mock
AI_PROMPT_VERSION=prompt-mvp-1.0
AI_TIMEOUT_MS=15000
AI_MAX_RETRIES=1
AI_FALLBACK_ENABLED=true

IDEMPOTENCY_TTL_HOURS=24
CORS_ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=120
AUDIT_LOG_ENABLED=true
ALLOW_SYNTHETIC_SEED=true
```

Never put real keys, tokens, production URLs or real personal data in `.env.example`.

## 9. Local Setup

### 9.1 Clone and Configure

```bash
git clone <repository-url> geocredit-ai
cd geocredit-ai
cp .env.example .env.local
npm ci
```

Update `.env.local` with local-only values. Keep the file ignored by Git.

### 9.2 Start Dependencies

```bash
docker compose up -d postgres object-storage
docker compose ps
```

Minimum PostgreSQL initialization:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

### 9.3 Migrate and Seed

```bash
npm run db:migrate
npm run seed -- --dataset GEOCREDIT_MVP_V1
npm run seed:verify -- --dataset GEOCREDIT_MVP_V1
```

Seed commands must stop when `APP_ENV=production` or the explicit seed flag is absent.

### 9.4 Start Application

```bash
npm run dev
```

Expected local endpoints:

| Endpoint | Purpose |
|---|---|
| `http://localhost:3000` | Web application |
| `http://localhost:3000/api/health/live` | Process liveness |
| `http://localhost:3000/api/health/ready` | Dependency readiness |
| `http://localhost:3000/api/docs` | API documentation, if enabled |

### 9.5 Local Smoke Test

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e -- --grep @smoke
```

## 10. Container Build

Use a multi-stage build and run as a non-root user.

```dockerfile
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/package*.json ./
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/.next ./.next
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Adjust paths for the actual framework. Do not bake secrets or `.env` files into the image.

Build and inspect:

```bash
docker build -t geocredit-ai:${BUILD_VERSION:-local} .
docker image inspect geocredit-ai:${BUILD_VERSION:-local}
```

## 11. Database Migration Strategy

### Rules

- Migrations are ordered, immutable after release and reviewed.
- Use a separate migration identity where possible.
- Take a verified backup before destructive or irreversible production-like changes.
- Prefer expand/migrate/contract changes for compatibility.
- Application instances must not race to execute migrations on startup.
- PostGIS extension availability is checked before geography columns/indexes.
- Seed scripts are separate from migrations.

### Pre-Deployment

```bash
npm run db:migrate:status
npm run db:migrate:validate
```

### Deployment

```bash
npm run db:migrate
npm run db:migrate:status
```

### Post-Migration Checks

```sql
SELECT current_database(), current_user;
SELECT PostGIS_Version();
SELECT version, applied_at FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;
```

Rollback SQL must be tested, but a data-destroying down migration must not be executed automatically. Prefer restoring application compatibility or rolling forward.

## 12. CI Pipeline

```mermaid
flowchart LR
    A[Checkout] --> B[Install]
    B --> C[Lint and Types]
    C --> D[Unit Tests]
    D --> E[PostGIS Integration]
    E --> F[Build and Scan]
    F --> G[E2E Smoke]
    G --> H[Publish Artifact]
```

### Required Gates

1. Lockfile-based clean install.
2. Secret scan, lint and type checking.
3. Unit tests including financial/risk boundaries.
4. Disposable PostgreSQL/PostGIS integration tests.
5. Migration from an empty database.
6. Seed and verification script.
7. 499m/500m/501m radius tests.
8. Production build.
9. Dependency/container vulnerability scan.
10. Critical E2E smoke tests.
11. Immutable image/artifact tagged with full commit SHA.

## 13. Deployment Sequence

### Pre-Deployment Checklist

- [ ] Target environment and release version confirmed.
- [ ] CI gates passed for exact commit.
- [ ] Change list and known limitations reviewed.
- [ ] Required secrets/configuration exist.
- [ ] Database backup/restore capability verified where applicable.
- [ ] Migration reviewed and tested.
- [ ] AI/risk/prompt versions confirmed.
- [ ] Rollback owner and previous artifact identified.
- [ ] Demo/UAT users and seed policy confirmed.

### Deployment Steps

1. Place release under change control; announce deployment window.
2. Verify target environment configuration without printing secrets.
3. Take/verify database backup when required.
4. Run pre-migration validation.
5. Apply database migrations once.
6. Deploy the immutable application artifact.
7. Wait for liveness and readiness checks.
8. Run post-deployment smoke tests.
9. Load/refresh synthetic seed only in explicitly approved demo environments.
10. Record release version, migration version and smoke-test evidence.

### Reference Commands

```bash
export RELEASE_VERSION=<full-commit-sha-or-tag>
npm run db:migrate:status
npm run db:migrate
<platform-deploy-command> geocredit-ai:${RELEASE_VERSION}
npm run smoke -- --base-url "$APP_BASE_URL"
```

Do not place secrets directly in shell history or deployment commands.

## 14. Health Checks

### Liveness

`GET /api/health/live`

- Confirms the process can respond.
- Must not query all external dependencies.
- Returns non-sensitive build/version metadata.

### Readiness

`GET /api/health/ready`

- Confirms database connectivity and required migration version.
- Confirms PostGIS extension is available.
- Confirms required configuration is present.
- May report AI/object storage as degraded when safe fallback is available.
- Must never expose credentials, connection strings or stack traces.

Example response:

```json
{
  "status": "ready",
  "version": "<build-version>",
  "checks": {
    "database": "ok",
    "postgis": "ok",
    "objectStorage": "ok",
    "aiProvider": "degraded"
  }
}
```

## 15. Post-Deployment Smoke Tests

| ID | Check | Expected |
|---|---|---|
| SMK-01 | Liveness/readiness | Healthy or documented safe degradation |
| SMK-02 | Login as field role | Correct dashboard and scope |
| SMK-03 | Customer search/detail | Masked profile and history load |
| SMK-04 | Save application draft | Data persists; version increments |
| SMK-05 | Dabi/Progoti queue | Correct role assignments |
| SMK-06 | Workflow action | Valid transition and audit record |
| SMK-07 | 500m query | Expected seeded boundary result |
| SMK-08 | Risk assessment | Separate customer/area results |
| SMK-09 | AI report | Schema-valid report or safe fallback |
| SMK-10 | Unauthorized request | Denied without data leakage |

## 16. Demo Environment Setup

### Reset Procedure

1. Confirm the target is the demo environment.
2. Confirm no user-created demonstration evidence must be retained.
3. Stop active demo sessions or announce reset.
4. Run the seed-scoped reset.
5. Load and verify `GEOCREDIT_MVP_V1`.
6. Run demo smoke tests.

```bash
npm run seed:reset -- --dataset GEOCREDIT_MVP_V1
npm run seed -- --dataset GEOCREDIT_MVP_V1
npm run seed:verify -- --dataset GEOCREDIT_MVP_V1
npm run test:e2e -- --grep @demo-smoke
```

Reset must target only records marked with the exact dataset identity. Never use broad deletion commands against a shared or uncertain database.

### Demo Fallbacks

- AI unavailable: deterministic templated report.
- Map unavailable: coordinates plus aggregate area metrics.
- Camera unavailable: approved bundled placeholder image.
- GPS unavailable: deterministic synthetic demo point with visible demo label.
- External identity unavailable: guarded demo login in demo environment only.

## 17. Rollback and Recovery

### Rollback Triggers

- Unauthorized access or decision permission.
- Application/workflow data corruption.
- Migration failure or readiness failure.
- Incorrect 500m calculation.
- Severe error rate/latency regression.
- AI output bypasses validation or human-review controls.

### Application Rollback

1. Stop further rollout.
2. Disable affected feature via approved configuration if safer.
3. Redeploy the last known-good immutable artifact.
4. Confirm database compatibility before rollback.
5. Run health checks and P0 smoke tests.
6. Record incident, scope and recovery evidence.

### Database Recovery

- Prefer a forward fix for compatible schema changes.
- Do not automatically run destructive down migrations.
- Restore from backup only after confirming exact environment, recovery point and data-loss window.
- Reconcile workflow/audit state after restoration.
- Validate PostGIS indexes and risk/application version links.

## 18. Security Requirements

- HTTPS is mandatory outside local development.
- Database and storage must not be publicly reachable.
- Use least-privilege application, migration and read-only identities.
- Encrypt sensitive data at rest and in transit.
- Keep media private; use short-lived authorized URLs.
- Validate MIME type, extension, size and safe image decoding.
- Restrict CORS to exact trusted origins.
- Use secure, HTTP-only and appropriate same-site cookies where applicable.
- Apply CSRF protection to cookie-authenticated mutations.
- Rate-limit login, search, upload and AI-generation routes.
- Redact tokens, IDs, coordinates and sensitive fields from logs according to policy.
- Disable debug endpoints, demo role switching and API docs in production unless explicitly protected.
- Rotate any secret suspected of exposure; redeploy after rotation.

## 19. Observability

### Logs

Every request log should contain:

- Timestamp, level and service name
- Build/environment
- Correlation/request ID
- Route and HTTP method
- Status and duration
- Authenticated actor ID in a non-sensitive internal form
- Application/customer reference only when policy permits
- Error code, not raw sensitive payload

### Metrics

- Request count, error rate and p50/p95 latency
- Database pool usage and slow queries
- Workflow transition success/failure
- Geo verification success/failure
- 500m query latency and insufficient cohort count
- Risk calculation success/failure
- AI latency, schema failure, retry and fallback rate
- Media upload failure rate
- Offline sync conflict/idempotent replay count

### Alerts

For production-like environments, alert on:

- Sustained 5xx rate
- Readiness failure
- Database exhaustion or replication/storage issue
- Unauthorized-decision attempts above baseline
- Risk or AI processing failure spike
- Object-storage failure
- Audit write failure

Audit write failure for a material mutation should fail closed according to the approved policy.

## 20. Backup and Retention

- Configure encrypted database backups for UAT/production-like environments.
- Test restoration, not only backup creation.
- Apply separate retention policies for application data, audit data and media.
- Do not back up local/demo synthetic data longer than needed.
- Preserve audit/application version relationships.
- Document recovery point objective and recovery time objective before production use.

## 21. Troubleshooting

### Application Does Not Start

1. Check configuration validation error.
2. Confirm Node/runtime version.
3. Confirm database DNS/network and credential validity.
4. Verify required migration version.
5. Check that secrets are available to the runtime.

### PostGIS Error

```sql
SELECT PostGIS_Version();
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';
```

If absent, install/enable PostGIS using authorized database administration. Do not replace the final 500m logic with degree-based distance.

### 500m Result Is Incorrect

- Confirm longitude/latitude order is `(longitude, latitude)`.
- Confirm SRID `4326`.
- Confirm the column/query uses `geography` or an explicit geography cast.
- Confirm `ST_DWithin(..., 500.0)` is the authoritative filter.
- Confirm invalid/pending points are excluded.
- Verify the 499m/500m/501m fixtures.

### Migration Fails

- Stop deployment; do not start mixed application versions blindly.
- Capture migration name and safe error details.
- Check current migration table and database locks.
- Apply reviewed correction or restore according to recovery plan.

### AI Report Fails

- Confirm provider configuration without printing keys.
- Inspect timeout/schema-validation metrics.
- Use the deterministic fallback report.
- Confirm no workflow state changed.

### Image Upload Fails

- Check type/size validation and signed URL expiry.
- Confirm bucket policy and service permissions.
- Confirm CORS for direct browser upload if used.
- Retain draft state and offer safe retry.

### Offline Sync Conflict

- Preserve local changes.
- Fetch the current server version.
- Show conflict to the user; do not silently overwrite.
- Retry only with a new explicit version after resolution.

## 22. Environment Promotion Checklist

| Check | Local → Test | Test → Demo/UAT | UAT → Production |
|---|---:|---:|---:|
| CI passed | Required | Required | Required |
| Migration validated | Required | Required | Required |
| Seed allowed/verified | Yes | Explicit approval | Prohibited |
| Security scan | Recommended | Required | Required |
| P0 acceptance tests | Required | Required | Required |
| Business UAT | No | For UAT exit | Required |
| Backup/rollback | Basic | Verified | Formally tested |
| Production auth/integrations | Mock allowed | Prefer real/approved test | Required |
| Monitoring/alerts | Basic | Required | Required |
| Change approval | Team | Product/QA | Formal governance |

## 23. Release Record Template

| Field | Value |
|---|---|
| Release version | |
| Commit SHA | |
| Artifact/image digest | |
| Environment | |
| Deployed by | |
| Deployment time | |
| Migration version | |
| Risk engine version | |
| Prompt version | |
| Seed dataset version, if applicable | |
| Smoke-test result/evidence | |
| Known limitations | |
| Rollback version | |

## 24. MVP Operational Acceptance

The environment is ready when:

- configuration validation passes;
- PostgreSQL/PostGIS and required indexes are available;
- migrations match the application build;
- liveness and readiness checks pass;
- role and scope controls pass smoke tests;
- Dabi and Progoti demo workflows function;
- GPS boundary, risk assessment and AI fallback are verified;
- logs contain correlation data but no exposed secrets/PII;
- rollback target and owner are known; and
- demo/UAT seed data is explicitly identified as synthetic.

