# GeoCredit AI — API Specification

**Version:** MVP v1.0  
**Status:** Draft for Development  
**Style:** REST/JSON over HTTPS  
**Base Path:** `/api/v1`  
**Target:** Hackathon / 3-Day Demo MVP  
**Last Updated:** 03 September 2026

## 1. Purpose

This document defines the API contracts for GeoCredit AI. It covers authentication, customers, loan and savings history, applications, assessments, checklists, media/GPS verification, 500-meter area intelligence, explainable risk reports, workflow and audit history.

## 2. Core Rules

- All non-public endpoints require authentication.
- The server enforces role, department, organizational scope and workflow state.
- Client-side route or button visibility is not authorization.
- All timestamps use ISO 8601 UTC.
- All IDs are UUIDs unless explicitly documented.
- Money values are JSON numbers with a maximum of two decimal places.
- Mutating requests from offline-capable clients require `Idempotency-Key`.
- Mutable resources use optimistic concurrency through `version` or `If-Match`.
- GPS/image verification must be valid before field submission.
- Customer Risk and Area Risk are returned separately.
- AI output is advisory and never performs approval/rejection.
- Only RM may perform the final `APPROVE` or `REJECT` transition.

## 3. Authentication

### 3.1 Headers

```http
Authorization: Bearer <access-token>
Content-Type: application/json
Accept: application/json
X-Correlation-ID: optional-client-correlation-id
Idempotency-Key: required-for-supported-mutations
If-Match: "<resource-version>"
```

### 3.2 Token Claims

```json
{
  "sub": "user-uuid",
  "employeeId": "1547800",
  "role": "CDO",
  "department": "DABI",
  "organizationalUnitId": "branch-uuid",
  "areaId": "area-uuid",
  "regionId": "region-uuid",
  "exp": 1788433200
}
```

The backend must derive authorization from trusted server/token data, not from client-submitted role fields.

## 4. Common Response Format

### 4.1 Single Resource

```json
{
  "data": {},
  "meta": {
    "correlationId": "req_01J..."
  }
}
```

### 4.2 Collection

```json
{
  "data": [],
  "page": {
    "cursor": null,
    "nextCursor": "opaque-cursor",
    "limit": 20,
    "hasMore": true
  },
  "meta": {
    "correlationId": "req_01J..."
  }
}
```

### 4.3 Error

```json
{
  "error": {
    "code": "GEO_LOCATION_REQUIRED",
    "message": "Valid latitude and longitude are required before submission.",
    "fieldErrors": [
      {
        "field": "geoVerificationId",
        "code": "REQUIRED",
        "message": "Complete location verification."
      }
    ],
    "correlationId": "req_01J..."
  }
}
```

## 5. HTTP Status Codes

| Status | Usage |
|---:|---|
| 200 | Successful read/update/action |
| 201 | Resource created |
| 202 | Asynchronous processing accepted |
| 204 | Successful action with no body |
| 400 | Malformed input |
| 401 | Missing/invalid authentication |
| 403 | Role or organizational scope denied |
| 404 | Resource not found or not visible |
| 409 | Version conflict, duplicate or invalid workflow state |
| 413 | Media/request too large |
| 422 | Business validation failed |
| 429 | Rate limit exceeded |
| 500 | Unexpected internal error |
| 503 | Temporary dependency/service unavailable |

## 6. Endpoint Summary

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/refresh` | Refresh session |
| POST | `/auth/logout` | Revoke session |
| GET | `/me` | Current user and permissions |
| GET | `/customers` | Search accessible customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{customerId}` | Customer profile |
| PATCH | `/customers/{customerId}` | Update customer profile |
| GET | `/customers/{customerId}/loan-summary` | Loan behavior summary |
| GET | `/customers/{customerId}/loans` | Loan list/history |
| GET | `/loans/{loanId}/transactions` | Loan transactions |
| GET | `/customers/{customerId}/savings-summary` | Savings behavior summary |
| GET | `/customers/{customerId}/savings-transactions` | Savings transactions |
| POST | `/applications` | Create draft application |
| GET | `/applications` | Search/list applications |
| GET | `/applications/{applicationId}` | Complete application |
| PATCH | `/applications/{applicationId}` | Update draft/application data |
| PUT | `/applications/{applicationId}/financial-assessments/{role}` | Save assessment |
| GET | `/applications/{applicationId}/checklists` | Checklist definitions/responses |
| PUT | `/applications/{applicationId}/checklists/{templateCode}` | Save checklist responses |
| PUT | `/applications/{applicationId}/documents` | Save document checklist |
| POST | `/media/uploads` | Initiate private media upload |
| POST | `/media/uploads/{mediaId}/complete` | Complete upload |
| POST | `/geo-verifications` | Create geo verification |
| GET | `/geo-verifications/{verificationId}` | Verification status |
| POST | `/applications/{applicationId}/validate` | Validate transition readiness |
| POST | `/applications/{applicationId}/area-queries` | Start 500m analysis |
| GET | `/applications/{applicationId}/area-intelligence` | Area summary |
| GET | `/applications/{applicationId}/nearby-borrowers` | Privacy-safe nearby borrowers |
| POST | `/applications/{applicationId}/risk-assessments` | Generate risk report |
| GET | `/applications/{applicationId}/risk-report` | Frozen/current risk report |
| GET | `/workflow/inbox` | Role-specific review queue |
| POST | `/applications/{applicationId}/transitions` | Workflow action |
| GET | `/applications/{applicationId}/history` | Workflow/audit timeline |
| GET | `/sync/status` | Pending/failed sync summary |

## 7. Authentication APIs

### 7.1 Login

`POST /auth/login`

```json
{
  "employeeId": "1547800",
  "pin": "1234",
  "device": {
    "deviceId": "client-device-id",
    "platform": "ANDROID_PWA",
    "appVersion": "1.0.0"
  }
}
```

```json
{
  "data": {
    "accessToken": "token",
    "refreshToken": "token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "employeeId": "1547800",
      "displayName": "Demo CDO",
      "role": "CDO",
      "department": "DABI",
      "organizationalScope": {
        "branchId": "uuid",
        "areaId": "uuid",
        "regionId": "uuid"
      }
    }
  }
}
```

### 7.2 Current User

`GET /me`

```json
{
  "data": {
    "id": "uuid",
    "employeeId": "1547800",
    "displayName": "Demo CDO",
    "role": "CDO",
    "department": "DABI",
    "permissions": [
      "customer:read",
      "customer:write",
      "application:create",
      "geo:capture",
      "application:submit"
    ],
    "organizationalScope": {}
  }
}
```

## 8. Customer APIs

### 8.1 Search Customers

`GET /customers?q={query}&branchId={id}&limit=20&cursor={cursor}`

Response fields:

```json
{
  "data": [
    {
      "id": "uuid",
      "memberNo": "D-100012",
      "memberName": "Demo Customer",
      "project": "DABI",
      "branch": { "id": "uuid", "code": "101", "name": "Demo Branch" },
      "voCode": "VO-01",
      "activeLoanCount": 1,
      "latestApplicationStatus": "DRAFT"
    }
  ],
  "page": {}
}
```

### 8.2 Create Customer

`POST /customers`

Required role: CDO or CO.

```json
{
  "memberNo": "D-100012",
  "project": "DABI",
  "organizationalUnitId": "branch-uuid",
  "voCode": "VO-01",
  "profile": {
    "memberName": "Demo Customer",
    "dateOfBirth": "1988-04-11",
    "motherName": "Demo Name",
    "fatherName": "Demo Name",
    "gender": "FEMALE",
    "maritalStatus": "MARRIED",
    "occupation": "Small Business",
    "presentAddress": "Demo address",
    "permanentAddress": "Demo address",
    "primaryEarner": true,
    "idType": "NID",
    "idNo": "encrypted-by-backend",
    "spouse": {},
    "nominee": {}
  }
}
```

Response: `201 Created` with the customer resource.

### 8.3 Get Customer

`GET /customers/{customerId}`

Sensitive fields are masked according to caller permission.

### 8.4 Update Customer

`PATCH /customers/{customerId}`

Headers:

```http
Idempotency-Key: customer-update-uuid
If-Match: "4"
```

Response includes the incremented `version`.

## 9. Loan and Savings APIs

### 9.1 Loan Summary

`GET /customers/{customerId}/loan-summary`

```json
{
  "data": {
    "totalPreviousLoans": 3,
    "closedLoans": 2,
    "activeLoans": 1,
    "totalDisbursedAmount": 180000,
    "totalOverdueAmount": 4200,
    "delayedInstallments": 2,
    "missedCollectionDates": 1,
    "maximumOverdue": 4200,
    "averageCollectionPerformance": 0.93,
    "repaymentTrend": "DETERIORATING",
    "dataAsOf": "2026-08-30T00:00:00Z"
  }
}
```

### 9.2 Loan List

`GET /customers/{customerId}/loans?status=ACTIVE&limit=20&cursor={cursor}`

### 9.3 Loan Transactions

`GET /loans/{loanId}/transactions?limit=50&cursor={cursor}`

### 9.4 Savings Summary

`GET /customers/{customerId}/savings-summary`

```json
{
  "data": {
    "currentBalance": 5270,
    "depositFrequency": "REGULAR",
    "withdrawalFrequency": "LOW",
    "largeWithdrawalEvents": 1,
    "paymentMethodPattern": ["CASH", "BKASH"],
    "savingsConsistency": "MODERATE",
    "savingsTrend": "STABLE",
    "dataAsOf": "2026-08-30T00:00:00Z"
  }
}
```

## 10. Application APIs

### 10.1 Create Draft

`POST /applications`

```json
{
  "customerId": "uuid",
  "department": "DABI"
}
```

```json
{
  "data": {
    "id": "uuid",
    "applicationNo": "DABI-2026-00125",
    "customerId": "uuid",
    "department": "DABI",
    "status": "DRAFT",
    "version": 1,
    "prefilledCustomer": {}
  }
}
```

CDO may create Dabi; CO may create Progoti.

### 10.2 List Applications

`GET /applications?status=DRAFT&department=DABI&customerId={id}&limit=20&cursor={cursor}`

### 10.3 Get Complete Application

`GET /applications/{applicationId}`

Optional query: `?version=current` or `?version=2`.

Response sections:

```json
{
  "data": {
    "id": "uuid",
    "applicationNo": "DABI-2026-00125",
    "department": "DABI",
    "status": "BM_REVIEW",
    "version": 3,
    "allowedActions": ["RECOMMEND", "RETURN", "REQUEST_ADDITIONAL_VERIFICATION"],
    "customer": {},
    "loanInformation": {},
    "financialAssessments": [],
    "checklists": [],
    "documents": [],
    "geoVerification": {},
    "areaIntelligence": {},
    "riskReport": {},
    "workflowSummary": {}
  }
}
```

### 10.4 Update Loan Information

`PATCH /applications/{applicationId}`

```json
{
  "version": 1,
  "proposedAmount": 60000,
  "loanUser": "CUSTOMER",
  "loanType": "REPEAT",
  "durationMonths": 12,
  "loanPurpose": "Business expansion",
  "investmentSector": "Retail",
  "scheme": "GENERAL",
  "loanProduct": "DABI_STANDARD",
  "residenceType": "OWNED"
}
```

Only editable states accept updates.

## 11. Financial Assessment APIs

### 11.1 Upsert Assessment

`PUT /applications/{applicationId}/financial-assessments/{role}`

Allowed role examples: `CDO`, `BM`, `CO`.

```json
{
  "applicationVersion": 1,
  "income": {
    "primaryRegular": 28000,
    "alternative": 5000,
    "remittance": 0,
    "houseRent": 3000,
    "otherHousehold": 0,
    "spouseChildren": 7000
  },
  "expense": {
    "rentAndUtilities": 5000,
    "food": 12000,
    "education": 3000,
    "medical": 1500,
    "other": 2500
  },
  "liability": {
    "otherDebt": 5000,
    "monthlyCashInHand": 3000,
    "proposedInstallment": 6000,
    "tolerancePercent": 25
  },
  "remarks": "Stable household income."
}
```

Server response contains recalculated totals:

```json
{
  "data": {
    "totalIncome": 43000,
    "totalExpense": 24000,
    "availableSurplus": 19000,
    "proposedInstallment": 6000,
    "installmentBurdenRatio": 0.3158,
    "warnings": []
  }
}
```

### 11.2 Assessment Comparison

`GET /applications/{applicationId}/financial-assessments/comparison`

Returns CDO vs BM values, differences and configured alerts.

## 12. Checklist APIs

### 12.1 Get Checklists

`GET /applications/{applicationId}/checklists`

```json
{
  "data": [
    {
      "templateCode": "DABI_BM_CHECKLIST",
      "version": 1,
      "ownerRole": "BM",
      "title": "Dabi BM Checklist",
      "completion": { "answered": 8, "required": 12, "complete": false },
      "questions": [
        {
          "code": "SOCIAL_ACCEPTANCE",
          "text": "Social acceptance",
          "responseType": "SCALE_1_10",
          "required": true,
          "response": null
        }
      ]
    }
  ]
}
```

### 12.2 Save Checklist

`PUT /applications/{applicationId}/checklists/{templateCode}`

```json
{
  "templateVersion": 1,
  "responses": [
    { "questionCode": "SOCIAL_ACCEPTANCE", "value": 8 },
    { "questionCode": "FAMILY_AWARE", "value": true }
  ],
  "remarks": "Verified during household visit.",
  "complete": true
}
```

Server validates template version, role ownership and required responses.

### 12.3 Document Checklist

`PUT /applications/{applicationId}/documents`

```json
{
  "applicationVersion": 1,
  "documents": [
    { "code": "LOAN_UNDERTAKING", "status": "PRESENT", "remarks": null },
    { "code": "BANK_STATEMENT", "status": "MISSING", "remarks": "Requested" }
  ]
}
```

## 13. Media Upload APIs

### 13.1 Initiate Upload

`POST /media/uploads`

```json
{
  "purpose": "GEO_VERIFICATION",
  "applicationId": "uuid",
  "customerId": "uuid",
  "filename": "house.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 1824000,
  "checksumSha256": "64-character-hex"
}
```

```json
{
  "data": {
    "mediaId": "uuid",
    "uploadMethod": "PUT",
    "uploadUrl": "short-lived-private-upload-url",
    "requiredHeaders": {},
    "expiresAt": "2026-09-03T11:00:00Z"
  }
}
```

Upload URLs must never be written to general application logs.

### 13.2 Complete Upload

`POST /media/uploads/{mediaId}/complete`

```json
{
  "checksumSha256": "64-character-hex"
}
```

Response may be `202 Accepted` while media verification is processing.

## 14. Geo-Verification APIs

### 14.1 Create Verification

`POST /geo-verifications`

Headers require `Idempotency-Key`.

```json
{
  "clientCaptureId": "uuid-generated-on-device",
  "customerId": "uuid",
  "applicationId": "uuid",
  "mediaId": "uuid",
  "latitude": 23.780573,
  "longitude": 90.279239,
  "accuracyMeters": 12.4,
  "capturedAt": "2026-09-03T10:30:12Z",
  "device": {
    "deviceId": "client-device-id",
    "platform": "ANDROID_PWA",
    "appVersion": "1.0.0"
  }
}
```

```json
{
  "data": {
    "id": "uuid",
    "status": "PROCESSING",
    "latitude": 23.780573,
    "longitude": 90.279239,
    "accuracyMeters": 12.4,
    "capturedAt": "2026-09-03T10:30:12Z"
  }
}
```

### 14.2 Verification Status

`GET /geo-verifications/{verificationId}`

```json
{
  "data": {
    "id": "uuid",
    "status": "VALID",
    "validationReasons": [],
    "verifiedAt": "2026-09-03T10:31:02Z",
    "canStartAreaAnalysis": true
  }
}
```

Possible reasons include `MISSING_LOCATION`, `MISSING_MEDIA`, `CHECKSUM_MISMATCH`, `INVALID_MEDIA_TYPE`, `LOW_ACCURACY_WARNING`, and `PROCESSING_FAILED`.

## 15. Validation API

### 15.1 Validate Readiness

`POST /applications/{applicationId}/validate`

```json
{
  "intendedAction": "SUBMIT"
}
```

```json
{
  "data": {
    "valid": false,
    "blockingIssues": [
      {
        "code": "GEO_NOT_VERIFIED",
        "section": "GEO_VERIFICATION",
        "field": "geoVerificationId",
        "message": "Complete location verification."
      }
    ],
    "warnings": [
      {
        "code": "LOW_GPS_ACCURACY",
        "message": "GPS accuracy is lower than the preferred threshold."
      }
    ]
  }
}
```

## 16. Area Intelligence APIs

### 16.1 Start Area Query

`POST /applications/{applicationId}/area-queries`

```json
{
  "applicationVersion": 1,
  "geoVerificationId": "uuid",
  "radiusMeters": 500
}
```

The server must cap/validate the radius according to business configuration.

```json
{
  "data": {
    "areaQueryId": "uuid",
    "status": "PROCESSING",
    "radiusMeters": 500
  }
}
```

### 16.2 Area Intelligence

`GET /applications/{applicationId}/area-intelligence?version=current`

```json
{
  "data": {
    "areaQueryId": "uuid",
    "status": "COMPLETE",
    "radiusMeters": 500,
    "queryTimestamp": "2026-09-03T10:34:00Z",
    "borrowerCount": 12,
    "activeLoanCount": 8,
    "overdueBorrowerCount": 4,
    "totalExposure": 720000,
    "riskDistribution": {
      "LOW": 3,
      "MODERATE": 4,
      "HIGH": 4,
      "VERY_HIGH": 1
    },
    "metrics": [],
    "dataAvailability": {
      "sufficient": true,
      "missingMetrics": []
    }
  }
}
```

### 16.3 Nearby Borrowers

`GET /applications/{applicationId}/nearby-borrowers?limit=20&cursor={cursor}`

```json
{
  "data": [
    {
      "reference": "BRW-A81F2C",
      "distanceBandMeters": 125,
      "loanStatus": "ACTIVE",
      "riskLevel": "HIGH",
      "repaymentSummary": {
        "trend": "DETERIORATING",
        "hasOverdue": true
      },
      "savingsSummary": {
        "trend": "STABLE"
      },
      "mapPoint": {
        "latitude": 23.7805,
        "longitude": 90.2792,
        "precision": "APPROXIMATE"
      }
    }
  ],
  "page": {}
}
```

Prohibited fields: name, NID, phone, address, exact coordinate and detailed transactions.

## 17. Risk APIs

### 17.1 Generate Risk Report

`POST /applications/{applicationId}/risk-assessments`

```json
{
  "applicationVersion": 1,
  "areaQueryId": "uuid",
  "forceRegenerate": false
}
```

```json
{
  "data": {
    "requestId": "uuid",
    "status": "PROCESSING",
    "pollAfterSeconds": 2
  }
}
```

The endpoint is idempotent for the same application version, feature set and engine version.

### 17.2 Get Risk Report

`GET /applications/{applicationId}/risk-report?version=current`

```json
{
  "data": {
    "reportId": "uuid",
    "applicationId": "uuid",
    "applicationVersion": 1,
    "status": "READY",
    "humanReviewRequired": true,
    "customerRisk": {
      "assessmentId": "uuid",
      "score": 42,
      "level": "MODERATE"
    },
    "areaRisk": {
      "assessmentId": "uuid",
      "score": 68,
      "level": "HIGH"
    },
    "positiveFactors": [
      {
        "factorCode": "PREVIOUS_LOAN_COMPLETED",
        "label": "Previous loan completed",
        "severity": "MEDIUM",
        "evidenceText": "Two previous loans were successfully closed."
      }
    ],
    "riskFactors": [
      {
        "factorCode": "AREA_OVERDUE_CONCENTRATION",
        "label": "High nearby overdue concentration",
        "severity": "HIGH",
        "observedValue": 0.33,
        "comparisonValue": 0.20,
        "evidenceText": "4 of 12 nearby borrowers currently show overdue exposure."
      }
    ],
    "keyFindings": [
      "The customer has relatively stable individual behavior, while the surrounding area shows elevated repayment risk."
    ],
    "suggestedAction": {
      "code": "ADDITIONAL_REVIEW",
      "text": "Additional review recommended."
    },
    "dataAvailability": {},
    "versions": {
      "engine": "rules-1.0.0",
      "rules": "risk-rules-1",
      "thresholds": "risk-thresholds-1",
      "explanationTemplate": "report-template-1"
    },
    "generatedAt": "2026-09-03T10:42:00Z"
  }
}
```

The report must never contain a machine-generated final approval/rejection.

## 18. Workflow APIs

### 18.1 Review Inbox

`GET /workflow/inbox?department=DABI&riskLevel=HIGH&limit=20&cursor={cursor}`

Response item:

```json
{
  "applicationId": "uuid",
  "applicationNo": "DABI-2026-00125",
  "customer": { "id": "uuid", "memberNo": "D-100012", "displayName": "Demo Customer" },
  "department": "DABI",
  "status": "BM_REVIEW",
  "proposedAmount": 60000,
  "customerRiskLevel": "MODERATE",
  "areaRiskLevel": "HIGH",
  "waitingSince": "2026-09-03T10:45:00Z",
  "allowedActions": ["RECOMMEND", "RETURN", "REQUEST_ADDITIONAL_VERIFICATION"]
}
```

### 18.2 Transition Application

`POST /applications/{applicationId}/transitions`

```json
{
  "applicationVersion": 1,
  "action": "RECOMMEND",
  "expectedCurrentStatus": "BM_REVIEW",
  "remarks": "Checklist completed and verified."
}
```

Example response:

```json
{
  "data": {
    "actionId": "uuid",
    "applicationId": "uuid",
    "previousStatus": "BM_REVIEW",
    "currentStatus": "BM_RECOMMENDED",
    "nextOwnerRole": "AM",
    "performedBy": {
      "id": "uuid",
      "role": "BM"
    },
    "performedAt": "2026-09-03T11:15:00Z"
  }
}
```

### 18.3 Transition Matrix

| Current State | Role | Action | Next State |
|---|---|---|---|
| DRAFT | CDO | SUBMIT | SUBMITTED_BY_CDO |
| SUBMITTED_BY_CDO | BM | START_REVIEW | BM_REVIEW |
| BM_REVIEW | BM | RECOMMEND | BM_RECOMMENDED |
| BM_REVIEW | BM | RETURN | RETURNED_FOR_CORRECTION |
| BM_REVIEW | BM | REQUEST_ADDITIONAL_VERIFICATION | ADDITIONAL_VERIFICATION_REQUIRED |
| BM_RECOMMENDED | AM | START_REVIEW | AM_REVIEW |
| DRAFT | CO | SUBMIT | SUBMITTED_BY_CO |
| SUBMITTED_BY_CO | AM | START_REVIEW | AM_REVIEW |
| AM_REVIEW | AM | RECOMMEND | AM_RECOMMENDED |
| AM_REVIEW | AM | RETURN | RETURNED_FOR_CORRECTION |
| AM_REVIEW | AM | REQUEST_ADDITIONAL_VERIFICATION | ADDITIONAL_VERIFICATION_REQUIRED |
| AM_RECOMMENDED | RM | START_REVIEW | RM_REVIEW |
| RM_REVIEW | RM | APPROVE | APPROVED |
| RM_REVIEW | RM | REJECT | REJECTED |

`RETURN`, `REQUEST_ADDITIONAL_VERIFICATION`, and `REJECT` require non-empty remarks.

## 19. Application History API

`GET /applications/{applicationId}/history?limit=50&cursor={cursor}`

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "WORKFLOW_ACTION",
      "action": "RECOMMEND",
      "fromStatus": "BM_REVIEW",
      "toStatus": "BM_RECOMMENDED",
      "actor": { "id": "uuid", "displayName": "Demo BM", "role": "BM" },
      "remarks": "Checklist completed and verified.",
      "applicationVersion": 1,
      "createdAt": "2026-09-03T11:15:00Z"
    }
  ],
  "page": {}
}
```

## 20. Sync Status API

`GET /sync/status`

```json
{
  "data": {
    "serverTime": "2026-09-03T11:20:00Z",
    "lastSuccessfulSyncAt": "2026-09-03T11:18:00Z",
    "pendingServerTasks": 0,
    "failedServerTasks": 0
  }
}
```

Client-only outbox details remain on the device and do not need to be uploaded unless operational support requires them.

## 21. Error Codes

| Code | HTTP | Meaning |
|---|---:|---|
| `AUTHENTICATION_REQUIRED` | 401 | No valid session |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `AUTH_SCOPE_DENIED` | 403 | Role/scope not allowed |
| `RESOURCE_NOT_FOUND` | 404 | Not found or not visible |
| `VERSION_CONFLICT` | 409 | Resource changed since client read |
| `IDEMPOTENCY_CONFLICT` | 409 | Key reused for different request |
| `APPLICATION_NOT_EDITABLE` | 409 | State is not editable |
| `INVALID_WORKFLOW_TRANSITION` | 409 | Action invalid for role/state |
| `REQUIRED_FIELD_MISSING` | 422 | Required input absent |
| `FINANCIAL_DATA_INVALID` | 422 | Financial values/calculation invalid |
| `CHECKLIST_INCOMPLETE` | 422 | Required checklist unanswered |
| `REMARKS_REQUIRED` | 422 | Required action remarks absent |
| `IMAGE_REQUIRED` | 422 | Geo image absent |
| `GEO_LOCATION_REQUIRED` | 422 | Latitude/longitude absent |
| `GEO_NOT_VERIFIED` | 422 | Server has not validated evidence |
| `AREA_QUERY_PENDING` | 409 | Area analysis not complete |
| `AREA_DATA_INSUFFICIENT` | 200/422 | Insufficient cohort/data per policy |
| `RISK_REPORT_PENDING` | 409 | Risk report not ready |
| `MEDIA_TOO_LARGE` | 413 | Upload exceeds limit |
| `UNSUPPORTED_MEDIA_TYPE` | 422 | Invalid file type |
| `RATE_LIMITED` | 429 | Too many requests |

## 22. Idempotency

Idempotency is required for:

- Customer create/update from offline queue
- Application create/update/submit
- Media completion
- Geo verification create
- Area query start
- Risk assessment request
- Workflow transition

Rules:

1. The same user, endpoint and key with the same request body returns the original logical result.
2. The same key with a different request body returns `409 IDEMPOTENCY_CONFLICT`.
3. The server retains keys for an agreed period; suggested MVP minimum is 24 hours.
4. Workflow actions also compare the expected current status.

## 23. Pagination and Filtering

- Use cursor pagination for lists.
- Default limit: 20.
- Maximum limit: 100.
- Cursors are opaque.
- Sorting fields must be allowlisted.
- Search input length and wildcard behavior must be restricted.
- Server always applies authorization scope before pagination.

## 24. Rate Limits

Suggested MVP defaults per authenticated user:

| Endpoint Group | Limit |
|---|---:|
| Login | 5 attempts per 5 minutes per identity/IP |
| Customer search | 60 per minute |
| Reads | 120 per minute |
| Mutations | 30 per minute |
| Media initiation | 10 per minute |
| Area analysis | 10 per minute |
| Risk generation | 10 per minute |
| Workflow decision | 10 per minute |

Exact limits remain configurable.

## 25. Privacy and Logging

- Do not log PINs, access/refresh tokens, NIDs, full addresses, exact coordinates or upload URLs.
- Log correlation ID, endpoint, user ID, role, status, latency and sanitized error code.
- Record access audit for geo evidence, nearby borrower detail, risk report and final decision.
- AI explanation payloads must exclude unnecessary direct identifiers.
- Nearby borrower response is a dedicated minimized contract.

## 26. Acceptance Criteria

- Every endpoint requires the expected authentication and authorization.
- Customer search returns only the user's permitted scope.
- Application create enforces CDO/Dabi and CO/Progoti mapping.
- Server recalculates financial totals.
- Missing or invalid GPS/image blocks field submission.
- 500-meter search uses the verified server-side coordinate.
- Applicant is excluded from nearby results.
- Nearby response contains no restricted PII.
- Risk generation returns separate customer and area assessments.
- Every risk factor contains a reason code and evidence.
- AI report always sets `humanReviewRequired: true`.
- Frozen report can be retrieved by application version.
- Invalid workflow transitions return `409`.
- Only RM can approve or reject.
- Return, additional verification and reject require remarks.
- Duplicate idempotent requests do not create duplicate resources/actions.
- Version conflicts return `409 VERSION_CONFLICT`.
- Major actions appear in application history with actor and timestamp.

