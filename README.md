# GeoCredit AI MVP

Milestone 1 establishes the backend foundation and a thin Dabi walking skeleton. This is a hackathon MVP foundation, not a production-ready lending system.

## Local setup

```bash
copy .env.example .env
npm.cmd install
docker compose up -d postgres
npm.cmd run db:migrate
npm.cmd run seed
npm.cmd run seed:verify
```

Run the API with `npm.cmd run dev`. It listens on port 3001.

Development login is available only when `AUTH_PROVIDER=development` and `APP_ENV` is not `production`:

```text
POST /api/v1/auth/login       {"username":"cdo.demo"}
GET  /api/v1/auth/me          Authorization: Bearer <token>
GET  /api/v1/customers        Authorization: Bearer <token>
POST /api/v1/applications     Authorization: Bearer <token>
POST /api/v1/applications/:id/transitions
                              Authorization + If-Match + Idempotency-Key
                              {"action":"SUBMIT"}
POST /api/v1/applications/:id/geo-verification
                              Authorization + If-Match
                              server-authoritative GPS evidence validation
POST /api/v1/applications/:id/area-intelligence
                              Authorization + If-Match
                              PostGIS 500m nearby-borrower snapshot
GET  /api/v1/applications/:id/area-intelligence
POST /api/v1/media/upload-sessions
                              Creates an expiring private upload session
POST /api/v1/media/:id/content
                              X-Upload-Token + {"contentBase64":"..."}
```

The server derives the target status from the action and current state. Every protected request checks active identity, role, department, scope, status, version and idempotency. RM is the only role with final-decision transitions.

## Verification commands

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run db:migrate
npm.cmd run seed
npm.cmd run seed:verify
```

Milestone 4 adds PostGIS-backed geo verification, private media references, 500m authoritative area queries, privacy-safe nearby-borrower summaries and insufficient-cohort outcomes. Integration/E2E, full mobile APK, responsive web UI and deployment commands remain reserved for later milestones.

Production authentication requires `AUTH_PROVIDER` to be non-development and `AUTH_JWT_SECRET` to be set. Bearer tokens must be signed HS256 JWTs with a `sub` matching an active user; optional issuer, audience and expiry claims are enforced when configured. Development login is unavailable in production.

Media upload sessions are short-lived and single-use. MinIO is available through Compose on `http://localhost:59000` with its console at `http://localhost:59001`; the private bucket is created automatically. The API returns a presigned `PUT` URL from `POST /api/v1/media/s3-upload-sessions`; upload the bytes directly to that URL, then call `POST /api/v1/media/{mediaId}/s3-complete` with the upload token. Keep the bucket private and rotate the demo MinIO credentials before deployment.
