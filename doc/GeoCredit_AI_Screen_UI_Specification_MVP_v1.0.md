# GeoCredit AI — Screen/UI Specification

**Version:** MVP v1.0  
**Status:** Draft for Design and Development  
**Source:** Geo Credit AI PRD, Solution Architecture, Technical Requirements and User Flow  
**Target:** Hackathon / 3-Day Demo MVP  
**Last Updated:** 03 September 2026

---

## 1. Purpose

This document defines the screen-level UI requirements for the GeoCredit AI MVP. It is intended as a direct reference for AI-assisted frontend development.

The MVP must support:

- Mobile/PWA workflows for CDO, CO and BM
- Desktop web workflows for AM and RM
- Customer and application data entry
- GPS and image verification
- 500-meter area intelligence
- Explainable customer and area risk reports
- Human review, recommendation and final decision

> All AI report screens must display: **AI Recommendation — Human Review Required**

---

## 2. UI Design Principles

1. **Field-first:** Optimize primary CDO/CO actions for one-handed mobile use.
2. **Progressive disclosure:** Show summaries first; detailed transactions remain expandable.
3. **Clear status:** Always show application, sync, GPS and report status.
4. **Separate risks:** Customer Risk and Area Risk must never appear as one unexplained score.
5. **Explain every warning:** Show the source or reason behind risk indicators.
6. **Human authority:** Suggested actions must not look like automated decisions.
7. **Offline clarity:** Clearly differentiate locally saved, synced and verified records.
8. **Privacy by design:** Display only minimum necessary nearby-borrower information.
9. **Error recovery:** Every failure state must provide a clear next action.
10. **Demo speed:** The primary Dabi flow should be completable without unnecessary navigation.

---

## 3. Responsive Breakpoints

| Breakpoint | Width | Expected Layout |
|---|---:|---|
| Mobile | 360–767px | Single column, bottom navigation, sticky primary action |
| Tablet | 768–1023px | Single/two-column forms, sidebar or bottom navigation |
| Desktop | 1024–1439px | Persistent sidebar, content area, optional right summary panel |
| Large desktop | ≥1440px | Max-width content, wider tables and side-by-side review panels |

### 3.1 Content Width

- Form content: maximum 960px
- Review content: maximum 1280px
- Long text: maximum readable line length around 75 characters
- Mobile page padding: 16px
- Desktop page padding: 24–32px

---

## 4. Visual System

### 4.1 Color Tokens

| Token | Suggested Value | Usage |
|---|---|---|
| `primary` | `#1F5F99` | Primary buttons, links and active navigation |
| `primary-dark` | `#16324F` | Headings and high-emphasis text |
| `accent` | `#2A7F86` | Geo and verification states |
| `success` | `#2F6B4F` | Valid, synced, approved and positive indicators |
| `warning` | `#9A6A00` | Moderate risk, attention and pending states |
| `danger` | `#A12B2B` | High risk, errors, reject and blocked states |
| `very-high-risk` | `#6F1D3B` | Very high risk only |
| `surface` | `#FFFFFF` | Main cards and panels |
| `surface-muted` | `#F4F6F9` | Secondary panels and table headers |
| `border` | `#D7DDE5` | Dividers, inputs and card borders |
| `text` | `#1A1A1A` | Body text |
| `text-muted` | `#5B6573` | Labels, hints and metadata |

Color must not be the only risk/status indicator. Always pair it with text and an icon.

### 4.2 Typography

| Role | Mobile | Desktop | Weight |
|---|---:|---:|---:|
| Page title | 24px | 30px | 700 |
| Section title | 20px | 22px | 700 |
| Card title | 16px | 18px | 600 |
| Body | 15px | 16px | 400 |
| Label | 13px | 14px | 600 |
| Helper/metadata | 12px | 13px | 400 |

Recommended font: `Inter`, with system-ui fallback.

### 4.3 Spacing and Shape

- Base spacing unit: 4px
- Common spacing: 8, 12, 16, 24 and 32px
- Card radius: 10–12px
- Input radius: 8px
- Button minimum height: 44px; mobile primary button: 48px
- Minimum touch target: 44 × 44px
- Card shadow: subtle or border-only; avoid heavy shadows

---

## 5. Global Components

| Component | Required Variants |
|---|---|
| Button | Primary, secondary, outline, text, danger, loading, disabled |
| Input | Text, numeric, currency, date, phone, search, readonly |
| Select | Single selection, searchable selection |
| Radio group | Yes/No, risk/action choices |
| Checkbox | Document checklist and acknowledgement |
| Textarea | Remarks and assessment comments |
| Card | Summary, data group, risk, warning, positive |
| Status badge | Application, sync, GPS, risk and decision status |
| Stepper | Application creation stages |
| Tabs | Application detail modules |
| Accordion | Historical transactions and long checklist sections |
| Data table | Sort, filter, pagination and responsive card fallback |
| Modal/dialog | Confirmation, warning and destructive/final action |
| Toast | Short success/error confirmation |
| Inline alert | Persistent warning, missing data or validation issue |
| Skeleton | Loading profile, report and table data |
| Empty state | No data, no search result or no assigned task |
| Map | Applicant point, radius, nearby marker and legend |
| Timeline | Workflow actions and audit history |

---

## 6. Global Application Shell

### 6.1 Mobile Shell

```text
┌──────────────────────────────┐
│ Logo / Page Title      Alerts│
├──────────────────────────────┤
│                              │
│        Screen Content        │
│                              │
├──────────────────────────────┤
│ Home Customers Apps Profile │
└──────────────────────────────┘
```

Requirements:

- Header displays page title and relevant status/action.
- Bottom navigation contains a maximum of five items.
- Primary screen action may use a sticky bottom action bar.
- Content must not be hidden behind bottom navigation.

### 6.2 Desktop Shell

```text
┌───────────────┬──────────────────────────────────────┐
│ Logo          │ Page title     Search   Alerts  User │
│ Dashboard     ├──────────────────────────────────────┤
│ Applications  │                                      │
│ Customers     │             Main Content             │
│ Reports       │                                      │
│               │                                      │
└───────────────┴──────────────────────────────────────┘
```

Requirements:

- Sidebar is collapsible.
- Current navigation item is visually clear.
- Role and organizational context appear in the user menu.
- Desktop review pages may use a sticky right-side decision panel.

---

## 7. Screen Inventory

| ID | Screen | Primary Roles | Priority |
|---|---|---|---|
| SCR-01 | Login | All | Must |
| SCR-02 | Field Dashboard | CDO, CO | Must |
| SCR-03 | Reviewer Dashboard | BM, AM, RM | Must |
| SCR-04 | Customer Search/List | CDO, CO | Must |
| SCR-05 | Create/Edit Customer | CDO, CO | Must |
| SCR-06 | Customer Overview | All assigned roles | Must |
| SCR-07 | Loan Behavior | All assigned roles | Must |
| SCR-08 | Savings Behavior | All assigned roles | Must |
| SCR-09 | New Application Setup | CDO, CO | Must |
| SCR-10 | Loan Information Form | CDO, CO | Must |
| SCR-11 | Financial Assessment | CDO, CO, BM as applicable | Must |
| SCR-12 | Checklist | BM, AM, CO | Must |
| SCR-13 | Document Checklist | CO, AM/RM view | Progoti Must |
| SCR-14 | Geo Capture | CDO, CO, BM if required | Must |
| SCR-15 | Geo Verification Result | CDO, CO, BM | Must |
| SCR-16 | Area Intelligence | All assigned roles | Must |
| SCR-17 | Map View | All assigned roles | Should |
| SCR-18 | AI Risk Report | All assigned roles | Must |
| SCR-19 | Application Review | BM, AM, RM | Must |
| SCR-20 | Workflow Action Dialog | BM, AM, RM | Must |
| SCR-21 | Application Timeline | All assigned roles | Must |
| SCR-22 | Offline Sync Center | CDO, CO, BM | Should |
| SCR-23 | Notifications/Tasks | All | Should |

---

## 8. SCR-01 — Login

### Purpose

Authenticate the user and route them to the correct role dashboard.

### Layout

- GeoCredit AI logo/name
- Short product description
- Employee ID field
- PIN/password field with show/hide control
- Sign In button
- Connection status indicator
- Demo role shortcuts only in the hackathon environment

### States

| State | UI Behavior |
|---|---|
| Default | Sign In enabled after required fields are entered |
| Loading | Disable form; show spinner inside button |
| Invalid | Inline error under credential field and error alert |
| Offline | Show connectivity warning and cached-session guidance |
| Inactive user | Blocking account message |

### Validation

- Employee ID is required.
- PIN/password is required.
- Avoid revealing which credential was incorrect.

---

## 9. SCR-02 — Field Dashboard

### Users

CDO and CO.

### Content

- Greeting and role/branch context
- Sync status banner
- KPI cards:
  - Draft applications
  - Requires correction
  - Pending synchronization
  - Submitted today
- Quick actions:
  - Search Customer
  - Add Customer
  - Continue Draft
- Recent applications list
- Assigned correction tasks

### Mobile Ordering

1. Offline/sync banner
2. Quick actions
3. Requires-attention items
4. Drafts
5. Recent applications

---

## 10. SCR-03 — Reviewer Dashboard

### Users

BM, AM and RM.

### Content

- Role-specific queue title
- Filters: department, area, branch, status, risk level and date
- Search by application/customer reference
- KPI cards:
  - New
  - In review
  - High/very-high risk
  - Returned
- Application queue table/cards

### Queue Columns

| Column | Mobile | Desktop |
|---|---:|---:|
| Application number | Yes | Yes |
| Customer reference/name | Yes | Yes |
| Department | Badge | Yes |
| Proposed amount | Yes | Yes |
| Customer risk | Badge | Yes |
| Area risk | Badge | Yes |
| Current status | Yes | Yes |
| Waiting time | No | Yes |
| Action | Open | Open Review |

---

## 11. SCR-04 — Customer Search/List

### Content

- Search field with customer/member reference or name
- Optional branch/VO filters
- Search result cards/table
- Add Customer button for CDO/CO

### Customer Result

- Customer/member reference
- Name
- Branch/VO
- Active loan indicator
- Latest application status
- Open Profile action

### Empty State

`No customer found.` Show **Add New Customer** only when the user has permission.

---

## 12. SCR-05 — Create/Edit Customer

### Structure

Use sections or a mobile stepper:

1. Organizational Information
2. Personal Information
3. Identification
4. Occupation and Address
5. Spouse Information
6. Nominee Information
7. Review and Save

### Key Fields

| Section | Fields |
|---|---|
| Organization | Branch Code, Area, Region, Division, Project, VO, Member No |
| Personal | Name, DOB, Mother, Father, Gender, Marital Status |
| Identification | ID Type, Member Category, spouse/nominee NID fields |
| Customer | Occupation, Present Address, Permanent Address, Primary Earner |
| Spouse | Name, NID Type/No, DOB, Occupation |
| Nominee | Name, NID Type/No, DOB, Relationship |

### Behavior

- Save Draft remains available.
- Required fields show `*` and inline validation.
- Same-address toggle copies present address to permanent address.
- NID values are masked on review screens.
- Unsaved changes trigger a leave confirmation.

---

## 13. SCR-06 — Customer Overview

### Header

- Customer name and member reference
- Department/project and organizational context
- Active/loan status badges
- Edit button for authorized CDO/CO
- New Application button for authorized CDO/CO

### Summary Cards

- Current loan status
- Previous loans
- Current savings balance
- Latest risk level, if available
- Verified location status

### Tabs

- Profile
- Loan Behavior
- Savings Behavior
- Geo Information
- Applications

Nearby-borrower users must not receive this full customer view unless otherwise authorized.

---

## 14. SCR-07 — Loan Behavior

### Summary

- Total previous loans
- Closed loans
- Active loans
- Total disbursed
- Total overdue
- Delayed installments
- Repayment trend

### Loan Cards/Table

- Disbursement date
- Loan serial/reference
- Amount
- Status
- Installment count
- Expand transaction history

### Transaction Table

- Collection date
- Target
- Collection
- Due
- Overdue
- Status
- Method

### Empty State

Show `No previous loan history available.` Do not label missing history as positive.

---

## 15. SCR-08 — Savings Behavior

### Summary

- Current balance
- Deposit frequency
- Withdrawal frequency
- Savings consistency
- Savings trend
- Recent large withdrawal indicator

### Transaction Table

- Date
- Savings own
- Security collection
- Withdrawal
- Balance
- Payment method

Use an optional simple line chart only if it can be implemented reliably within the MVP schedule.

---

## 16. SCR-09 — New Application Setup

### Content

- Selected customer summary
- Department/application type: Dabi or Progoti
- Auto-populated organizational information
- Existing active/draft application warning
- Start Application button

### Rules

- Default department based on current user.
- CDO can create Dabi applications.
- CO can create Progoti applications.
- Block accidental duplicate draft creation or require confirmation.

---

## 17. SCR-10 — Loan Information Form

### Shared Fields

- Proposed Amount
- Loan User
- Loan Type: New/Repeat
- Duration in months
- Investment Sector
- Scheme
- Loan Product

### Progoti Additional Field

- Loan Purpose

### UI Behavior

- Currency uses numeric keyboard on mobile.
- Amount displays formatted value but stores a numeric value.
- Product/scheme dependencies filter available selections.
- Sticky actions: **Save Draft** and **Continue**.
- Display application stepper at the top.

---

## 18. SCR-11 — Financial Assessment

### Dabi Sections

1. Monthly Income
2. Monthly Expense
3. Liabilities
4. Residence
5. Summary

### Progoti Sections

1. Income Sources
2. Monthly Expenses
3. Proposed Installment
4. Tolerance/Affordability
5. Summary

### Calculation Summary Card

| Value | Behavior |
|---|---|
| Total Income | Auto-calculated, read-only |
| Total Expense | Auto-calculated, read-only |
| Available Surplus | Income minus expense |
| Proposed Installment | Entered or calculated |
| Installment Burden | Installment relative to surplus |
| Tolerance | Configurable formula/result |

### Warning States

- Expense exceeds income
- Proposed installment exceeds available surplus
- Required income/expense field missing
- BM assessment differs materially from CDO assessment

For the BM view, show CDO and BM values side-by-side with the percentage difference.

---

## 19. SCR-12 — Checklist

### Layout

- Checklist title and role
- Progress: `8 of 12 completed`
- Grouped questions
- Yes/No radio or appropriate numeric input
- Required indicator
- Remarks textarea
- Save Draft and Complete buttons

### Special Inputs

- Social acceptance: 1–10 scale
- Guarantor repayment ability: 1–10 scale
- Income/amount values: formatted numeric input
- Long remarks: textarea with character guidance

### Behavior

- Unanswered required questions are highlighted on Complete.
- Completed answers become read-only for later roles unless the workflow returns the application.
- Later reviewers see respondent, role and timestamp.

---

## 20. SCR-13 — Progoti Document Checklist

### Row Design

- Document name
- Status: Present / Missing / Not Applicable, if approved
- Optional remarks
- Optional evidence/view action

### Summary

- Total required
- Present
- Missing
- Overall readiness status

Missing required documents must be visible to AM and RM and must not be hidden inside a collapsed panel.

---

## 21. SCR-14 — Geo Capture

### Pre-Capture State

- Customer/application reference
- Camera permission status
- GPS status
- Current GPS accuracy
- Instructions:
  - Stand near the customer's house/business
  - Ensure the location is enabled
  - Capture a clear exterior image
- Open Camera button

### Camera State

- Live camera preview
- GPS status badge
- Accuracy value
- Capture button
- Close/back action

### Preview State

- Captured image
- Latitude and longitude
- Accuracy
- Capture timestamp
- Retake button
- Use This Photo button

### Blocking Rules

- Capture/continue blocked when latitude or longitude is unavailable.
- Upload and verification are separate states.
- If offline, show **Saved on device** rather than **Submitted**.

---

## 22. SCR-15 — Geo Verification Result

### Success State

- Green Verified badge
- Image thumbnail
- Coordinates
- Accuracy
- Captured by and time
- View on Map
- Continue to Area Analysis

### Pending State

- `Uploading location evidence...`
- Progress indicator
- Safe retry/cancel guidance

### Failure State

- Clear reason: missing coordinate, upload failure or server validation failure
- Retake Photo
- Retry Upload
- Open GPS Settings, when relevant

---

## 23. SCR-16 — Area Intelligence

### Header Summary

- `500m Area Intelligence`
- Verified applicant coordinate indicator
- Query timestamp
- `12 nearby borrowers found`

### KPI Cards

- Nearby borrowers
- Active loans
- Total/current exposure
- Overdue concentration

### Risk Distribution

- Low count
- Moderate count
- High count
- Very High count

### Findings

- Positive area indicators
- Warning indicators
- Data availability note

### Nearby Borrower List

- Masked customer reference
- Distance/distance band
- Loan status
- Risk badge
- Repayment summary
- Savings summary

No name, NID, phone, exact address, exact coordinate or full transaction history.

---

## 24. SCR-17 — Map View

### Elements

- Applicant marker
- 500-meter radius circle
- Nearby borrower markers
- Risk legend
- Zoom controls
- List/Map toggle
- Recenter button

### Marker Detail

- Masked customer reference
- Approximate distance
- Loan status
- Risk level
- Open Summary action

If the map provider fails, the nearby borrower list and area metrics must remain available.

---

## 25. SCR-18 — AI Risk Report

### Layout

```text
┌─────────────────────────────────────────────┐
│ AI Recommendation — Human Review Required  │
├──────────────────────┬──────────────────────┤
│ Customer Risk        │ Area Risk            │
│ MODERATE · 42        │ HIGH · 68            │
├──────────────────────┴──────────────────────┤
│ Suggested Action                           │
├─────────────────────────────────────────────┤
│ Key Findings                               │
├──────────────────────┬──────────────────────┤
│ Positive Indicators  │ Risk Indicators      │
├──────────────────────┴──────────────────────┤
│ Data/Version/Generated Time                 │
└─────────────────────────────────────────────┘
```

### Required Components

- Persistent human-review notice
- Customer Risk card
- Area Risk card
- Suggested Action card
- Key Findings list
- Positive Indicators list
- Risk Indicators list
- Missing/stale data warning
- Report generation timestamp
- Rule/model/template version
- Acknowledge/Continue action for field officer

### Risk Badge Rules

| Level | Label | Icon/Pattern |
|---|---|---|
| LOW | Low Risk | Check/shield |
| MODERATE | Moderate Risk | Attention circle |
| HIGH | High Risk | Warning triangle |
| VERY_HIGH | Very High Risk | Critical/alert octagon |

### Prohibited UI

- Do not show an AI **Approve** or **Reject** button.
- Do not label suggested action as final decision.
- Do not hide the individual and area breakdown behind one score.
- Do not show factors unsupported by available data.

---

## 26. SCR-19 — Application Review

### Desktop Layout

- Left/main: application detail tabs
- Right/sticky panel:
  - Current workflow status
  - Customer risk
  - Area risk
  - Suggested action
  - Required checklist completion
  - Reviewer actions

### Mobile Layout

- Summary header
- Expandable review sections
- Sticky **Review Actions** button opens bottom sheet/dialog

### Review Header

- Application number
- Customer name/reference
- Department
- Proposed amount
- Current owner/status
- Submitted time
- Risk badges

### Section Completion

Each review section may show:

- Complete
- Warning
- Missing
- Not applicable
- Changed since prior version

---

## 27. SCR-20 — Workflow Action Dialog

### BM Actions

- Recommend to AM
- Request Additional Verification
- Return for Correction

### AM Actions

- Recommend to RM
- Request Additional Verification
- Return Application

### RM Actions

- Approve
- Reject

### Dialog Fields

- Selected action
- Remarks
- Reason category for return/additional verification/reject
- Confirmation checkbox for final decision, if desired
- Cancel
- Confirm Action

### Rules

- Remarks required for return, additional verification and reject.
- Final action dialog identifies that actor and timestamp will be recorded.
- Prevent double submission while processing.
- Success returns the user to the queue or updated application page.

---

## 28. SCR-21 — Application Timeline

### Timeline Event

- Action title
- From and to status
- Actor name/reference and role
- Timestamp
- Remarks
- Risk snapshot version, where relevant

### Example Events

- Application created
- GPS captured
- Evidence verified
- Risk report generated
- Submitted by CDO/CO
- BM recommended
- AM recommended
- Returned for correction
- RM approved/rejected

Events are read-only and ordered newest-first by default, with an option for chronological view.

---

## 29. SCR-22 — Offline Sync Center

### Content

- Current connection status
- Last successful sync
- Pending item count
- Failed item count
- Item list with type, customer/application reference, state and retry action
- Sync All button

### Status Labels

- Saved on device
- Queued
- Uploading
- Synced
- Verified
- Failed
- Conflict

Failed items must show a human-readable reason and recovery action.

---

## 30. SCR-23 — Notifications/Tasks

### Task Types

- New application for review
- Application returned for correction
- Additional verification required
- Sync failed
- Risk report generation failed
- Final decision recorded

### Task Card

- Title
- Application/customer reference
- Created time
- Priority/status
- Open action

For the hackathon, task cards may use seeded/in-app events without external delivery.

---

## 31. Form Validation Pattern

### Validation Timing

- On blur: field format validation
- On Continue: current section validation
- On Submit/Recommend: complete server-side validation

### Display Rules

- Error text appears directly below the input.
- Error summary appears at the top for long forms.
- Focus moves to the first invalid field after submit.
- Preserve all valid user-entered data after an error.
- Server error codes map to clear user-facing messages.

### Common Messages

| Code | Message |
|---|---|
| Required | This field is required. |
| Invalid amount | Enter a valid amount greater than zero. |
| Invalid date | Enter a valid date. |
| GPS required | Valid latitude and longitude are required. |
| Image required | Capture a house/business image before continuing. |
| Checklist incomplete | Complete all required checklist questions. |
| Remarks required | Enter remarks before continuing. |
| State changed | This application was updated by another user. Refresh to continue. |

---

## 32. Loading, Empty and Error States

| Context | Required UI |
|---|---|
| Page loading | Skeleton matching final layout |
| Button action | Inline spinner; disable duplicate action |
| No customer result | Empty state and authorized Add Customer action |
| No loan history | Neutral missing-data message |
| No savings history | Neutral missing-data message |
| No nearby borrowers | Distinguish valid zero result from query failure |
| Risk generating | Progress card and safe refresh/polling |
| Risk failed | Retry and support reference/correlation ID |
| Map failed | Keep list and metrics accessible |
| Upload failed | Retain local capture and show Retry Upload |
| Permission denied | Explain why permission is needed and link to settings |

---

## 33. Accessibility Requirements

- All inputs have visible labels.
- Error text is programmatically associated with the field.
- Keyboard users can complete all desktop actions.
- Focus is trapped and restored correctly for dialogs.
- Risk/status is communicated with text, icon and color.
- Minimum contrast meets WCAG AA where feasible.
- Tables provide headers and responsive alternatives.
- Icons include accessible names or are marked decorative.
- Camera and map flows have non-map/list fallbacks where possible.
- Animations respect reduced-motion preferences.

---

## 34. Role-Based UI Actions

| UI Action | CDO | CO | BM | AM | RM |
|---|---:|---:|---:|---:|---:|
| Create/edit customer | Yes | Yes | No | No | No |
| Create Dabi application | Yes | No | No | No | No |
| Create Progoti application | No | Yes | No | No | No |
| Capture primary GPS/image | Yes | Yes | Conditional verify | No | No |
| Complete BM checklist | No | No | Yes | No | No |
| Complete AM checklist | No | No | No | Yes | No |
| Complete Progoti checklist | No | Yes | No | Review | Review |
| View AI report | Yes | Yes | Yes | Yes | Yes |
| Recommend | Submit | Submit | To AM | To RM | No |
| Return/request verification | No | No | Yes | Yes | Optional per policy |
| Approve/reject | No | No | No | No | Yes |

---

## 35. Primary Demo Screen Sequence

1. Login as CDO
2. Field Dashboard
3. Customer Search
4. Customer Overview
5. Loan Behavior
6. Savings Behavior
7. New Dabi Application
8. Loan Information
9. Financial Assessment
10. Geo Capture
11. Geo Verification Result
12. Area Intelligence/Map
13. AI Risk Report
14. CDO Submission Confirmation
15. BM Reviewer Dashboard and Application Review
16. BM Checklist and Recommendation
17. AM Application Review and Recommendation
18. RM Application Review and Final Decision
19. Application Timeline

---

## 36. UI Acceptance Criteria

- UI is usable from 360px mobile width through desktop.
- Role-specific navigation and actions match authorization rules.
- Primary forms support save draft and preserve entered data.
- Existing profile fields auto-populate the new application.
- Financial totals update visibly and read-only calculated values are clear.
- Missing required data is shown inline and in an error summary.
- GPS and image status are visible throughout the capture flow.
- Offline records show `Saved on device`, never `Submitted` before synchronization.
- Area screen displays borrower count, risk distribution and privacy-safe nearby results.
- Customer Risk and Area Risk are visually separate.
- AI report contains factors, suggested action, timestamps and human-review notice.
- Reviewer screen shows current status, prior assessments and allowed actions.
- Return/reject actions require remarks.
- Only RM sees enabled Approve and Reject actions.
- Workflow history displays actor, role, action, time and remarks.
- Every loading, empty and failure state provides clear feedback or recovery.
- No nearby-borrower screen exposes prohibited personal information.

