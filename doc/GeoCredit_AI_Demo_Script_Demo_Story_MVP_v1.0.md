# GeoCredit AI — Demo Script / Demo Story

**Version:** MVP v1.0  
**Audience:** Hackathon Judges, Business, Credit Risk and Technology Stakeholders  
**Recommended Duration:** 8–10 minutes  
**Last Updated:** 03 September 2026

## 1. Demo Objective

Show how GeoCredit AI helps field and approving officers make faster, evidence-based and explainable loan decisions while preserving the existing human approval chain.

The demo must prove four things:

1. Field data, historical behavior and location evidence are brought together.
2. Risk is explained—not shown as a black-box number.
3. Nearby portfolio behavior within 500 meters adds local context.
4. AI advises; authorized people make the decision.

## 2. One-Sentence Pitch

> GeoCredit AI turns scattered customer, repayment, field and location data into one explainable credit view—so officers can make faster, more consistent and still fully human-controlled decisions.

## 3. Core Demo Story

Rahima is a fictional Dabi member applying for a repeat loan. She has a good repayment history and stable household surplus, but the approving team also needs field evidence and an understanding of portfolio behavior around her location. A CDO prepares the application, GeoCredit AI analyzes the customer and nearby area separately, and BM, AM and RM review the same evidence before RM makes the final decision.

The second short scenario shows a fictional Progoti borrower with financial stress and repayment concerns. It demonstrates that the system can identify risk without automatically rejecting the applicant.

> All names, IDs, financial records, coordinates and images used in the demo are synthetic.

## 4. Demo Roles and Data

| Role | Demo Account | Purpose |
|---|---|---|
| CDO | `SEED-CDO-01` | Create and submit Dabi application |
| BM | `SEED-BM-01` | Review Dabi field assessment |
| CO | `SEED-CO-01` | Create and submit Progoti application |
| AM | `SEED-AM-01` | Review Dabi and Progoti applications |
| RM | `SEED-RM-01` | Make final human decision |

| Scenario | Seed Reference | Expected Result |
|---|---|---|
| Primary Dabi | `DABI-SEED-001` or prepared equivalent | Customer LOW, Area LOW/MODERATE |
| High-risk Progoti | `PRO-SEED-005` | Customer VERY_HIGH, Area HIGH/VERY_HIGH |
| GPS boundary | `GEO-EDGE-499/500/501` | 499m/500m included; 501m excluded |
| Insufficient area data | `AREA-INSUFFICIENT` | `INSUFFICIENT_DATA`, not Low Risk |

## 5. Recommended Timing

| Time | Segment | Outcome |
|---:|---|---|
| 0:00–0:45 | Problem and promise | Audience understands why it matters |
| 0:45–2:30 | Customer 360° view | Historical and field context visible |
| 2:30–4:15 | GPS and 500m intelligence | Local portfolio context demonstrated |
| 4:15–5:30 | Explainable risk and AI report | Separate, evidence-based results shown |
| 5:30–7:15 | Dabi human approval workflow | CDO → BM → AM → RM completed |
| 7:15–8:30 | Progoti high-risk scenario | Risk detection without automation |
| 8:30–9:15 | Trust/control moment | Permission or boundary safeguard shown |
| 9:15–10:00 | Impact and close | Business value summarized |

## 6. Presenter Setup

Before the audience arrives:

- Reset and verify the `GEOCREDIT_MVP_V1` synthetic dataset.
- Open the application in a supported browser at 100% zoom.
- Prepare CDO, BM, AM, RM and CO sessions in separate browser profiles or tabs.
- Confirm no password, token or environment secret is visible.
- Open the primary Dabi application at the starting screen.
- Confirm map/GPS, risk and AI services are healthy or fallback mode is ready.
- Keep screenshots or a short recording of the complete flow as backup.
- Silence notifications and close unrelated applications/tabs.

## 7. Opening — Problem and Promise

**Duration:** 45 seconds  
**Screen:** GeoCredit AI landing/dashboard

### Presenter Says

“A credit officer often has to combine customer information, repayment history, field observations, paper or image evidence, and local portfolio knowledge. Those facts may be available, but not in one decision-ready view.

GeoCredit AI brings them together. It provides an explainable customer-risk assessment and a separate 500-meter area-risk assessment. Most importantly, it does not approve or reject loans. The existing CDO, BM, AM and RM roles stay in control.”

### Show

- Product name and role-aware dashboard.
- A visible label that the environment uses synthetic demo data.
- Assigned application counts/statuses.

### Key Message

This is decision support embedded in the existing process—not an autonomous credit decision system.

## 8. Scene 1 — CDO Opens the Customer 360° View

**Duration:** 1 minute 45 seconds  
**Actor:** CDO  
**Screen:** Customer search → Customer profile

### Presenter Actions

1. Sign in or switch to `Demo CDO One`.
2. Search for the seeded Dabi member.
3. Open customer profile.
4. Show customer details, previous loans and savings history.
5. Point out masked sensitive identifiers.

### Presenter Says

“The CDO begins with a single customer view. We can see the profile, previous loan performance, installment behavior and savings trend without switching systems or manually building a summary.

Sensitive identity details are masked, and access is restricted to the officer’s assigned organizational scope.”

### Expected Screen Results

- Customer project is Dabi.
- Two clean historical loans or the chosen positive pattern are visible.
- Savings trend is stable.
- Full sensitive identifier is not displayed.

### Business Value

Faster preparation and fewer decisions made with fragmented history.

## 9. Scene 2 — CDO Completes the Application

**Duration:** 1 minute  
**Actor:** CDO  
**Screen:** Dabi application form

### Presenter Actions

1. Open the prepared application draft.
2. Show loan purpose, proposed amount and tenure.
3. Show income, expense, liabilities and cash-in-hand entries.
4. Show calculated total income, total expense and available surplus.
5. Show checklist/document completion.

### Presenter Says

“The application combines requested loan information with a structured financial and field assessment. Calculations are performed again by the server, so the decision does not depend on a number typed or altered in the browser.

The officer may save an incomplete draft, but submission is blocked until required evidence and assessments are ready.”

### Expected Screen Results

- Financial totals reconcile.
- Available surplus and installment burden are visible.
- Required sections show Complete.
- Save Draft is allowed before submission.

## 10. Scene 3 — GPS Evidence and 500m Intelligence

**Duration:** 1 minute 45 seconds  
**Actor:** CDO/System  
**Screen:** Field verification → Area intelligence

### Presenter Actions

1. Show captured house/business image placeholder.
2. Show latitude, longitude, capture time and accuracy.
3. Run or open the verified 500m area search.
4. Show nearby eligible borrower count and aggregate portfolio metrics.
5. If the UI supports it, briefly show the boundary fixture.

### Presenter Says

“The location is more than a pin on a map. The server verifies the GPS capture and uses PostGIS to identify eligible borrowers within 500 meters.

This result is privacy-safe: reviewers see aggregate repayment and portfolio indicators, not the names or personal details of neighboring borrowers. The distance rule is precise—500 meters is included; anything beyond it is excluded.”

### Expected Screen Results

- Geo status is `VALID`.
- Search radius is 500 meters.
- Nearby results are aggregate only.
- Query time and/or snapshot information is visible.
- Area cohort meets minimum size or clearly shows insufficient data.

### Optional Trust Moment

Show the test points:

- 499m: included
- 500m: included
- 501m: excluded

### Key Message

Local context is calculated consistently and without exposing nearby members’ identities.

## 11. Scene 4 — Explainable Customer and Area Risk

**Duration:** 1 minute 15 seconds  
**Actor:** System/CDO  
**Screen:** Risk summary and AI report

### Presenter Actions

1. Show Customer Risk card.
2. Show Area Risk card separately.
3. Expand positive factors, risk factors and missing-data indicators.
4. Open the AI-generated report.
5. Point to the human-review disclaimer.

### Presenter Says

“GeoCredit AI deliberately keeps two questions separate. First: what does this customer’s own evidence tell us? Second: what does the surrounding portfolio tell us?

The score is calculated with transparent, versioned rules. AI then turns those structured findings into a readable summary. It is not allowed to invent inputs or trigger approval.”

### Expected Screen Results

- Customer and Area risk are not merged into an unexplained score.
- Factors have reason codes and evidence.
- Rule/prompt or generated version/time is available.
- `AI Recommendation — Human Review Required` is prominent.

### Key Message

The system explains why; the reviewer decides what to do.

## 12. Scene 5 — Dabi Approval Chain

**Duration:** 1 minute 45 seconds  
**Actors:** CDO → BM → AM → RM  
**Screens:** Submit, reviewer queues and decision

### Presenter Actions and Narration

#### CDO Submit

1. Acknowledge the AI report.
2. Click Submit.
3. Show status `SUBMITTED_BY_CDO` and BM assignment.

Say: “The CDO submits only after the application, GPS, area result and risk report are ready.”

#### BM Review

1. Switch to BM tab/session.
2. Open the application from the branch queue.
3. Start Review and show the BM checklist.
4. Click Recommend.

Say: “BM sees the same frozen evidence and can record an independent assessment. Differences from the field assessment are preserved rather than overwritten.”

#### AM Review

1. Switch to AM.
2. Open the application and recommend to RM.

Say: “AM reviews the evidence and recommendations at area level.”

#### RM Decision

1. Switch to RM.
2. Start final review.
3. Review customer risk, area risk and the AI report.
4. Click Approve and confirm.

Say: “Only RM can record the final decision. The system records who decided, when, against which application version, and with what remarks.”

### Expected Final Result

- Status becomes `APPROVED`.
- Decision actor is RM.
- Timeline shows the full Dabi chain.
- Application and report are read-only.

## 13. Scene 6 — Short Progoti High-Risk Story

**Duration:** 1 minute 15 seconds  
**Actors:** CO → AM → RM  
**Screen:** Prepared `PRO-SEED-005` application

### Presenter Actions

1. Open the prepared high-risk Progoti application.
2. Show weak surplus, external debt and irregular repayment factors.
3. Show high/very-high area indicators.
4. Show route history `CO → AM → RM` with no BM stage.
5. As RM, reject with mandatory human-entered remarks.

### Presenter Says

“Progoti uses a shorter CO-to-AM-to-RM route. Here the system highlights financial pressure and repayment concerns. These are signals, not a verdict. RM reviews the evidence and records the rejection with a reason.”

### Expected Result

- Customer and area factors remain explainable.
- No BM stage appears.
- AI does not execute the rejection.
- RM remarks are mandatory and audited.

## 14. Scene 7 — Trust and Control Demonstration

**Duration:** 45 seconds  
**Choose one primary demonstration; keep others ready for Q&A.**

### Option A — Permission Control

1. Switch to BM/AM/CDO.
2. Attempt final approval through UI or prepared test action.
3. Show permission denial and unchanged status.

Say: “Even if someone manipulates the screen or request, the backend checks the role, scope and current state. Only RM can decide.”

### Option B — Insufficient Area Data

1. Open `AREA-INSUFFICIENT`.
2. Show fewer borrowers than the configured privacy/reliability threshold.

Say: “Insufficient data is not presented as low risk. The system says it does not have enough evidence.”

### Option C — AI Failure

1. Use the demo failure switch or fallback fixture.
2. Show the deterministic fallback report.

Say: “If the AI service is unavailable or returns invalid output, the workflow stays safe. No decision is made, and a validated fallback summary is shown.”

## 15. Closing

**Duration:** 45 seconds  
**Screen:** Approved application timeline or dashboard

### Presenter Says

“GeoCredit AI brings customer history, field assessment, GPS evidence and local portfolio context into one explainable view. It supports both Dabi and Progoti workflows, keeps role permissions and audit history intact, and makes uncertainty visible.

The value is faster preparation, more consistent review and a clearer reason behind every recommendation—while the final decision remains with authorized BRAC officers.”

### Final Three Messages

- Better information at the point of decision.
- Explainable, location-aware risk—not a black box.
- Human authority and accountability remain unchanged.

## 16. Presenter Click Sheet

| # | Actor | Screen | Action | Expected Status/Result |
|---:|---|---|---|---|
| 1 | CDO | Dashboard | Open Dabi draft | `DRAFT` |
| 2 | CDO | Customer | Show profile/history | Masked, complete view |
| 3 | CDO | Financials | Show totals | Strong/expected surplus |
| 4 | CDO | Geo | Verify capture | `VALID` |
| 5 | CDO | Area | Open 500m result | Aggregate metrics |
| 6 | CDO | Risk | Open report | Separate Customer/Area |
| 7 | CDO | Submit | Submit | `SUBMITTED_BY_CDO` |
| 8 | BM | Queue | Start/recommend | `BM_RECOMMENDED` |
| 9 | AM | Queue | Start/recommend | `AM_RECOMMENDED` |
| 10 | RM | Queue | Start review | `RM_REVIEW` |
| 11 | RM | Decision | Approve | `APPROVED` |
| 12 | RM | Progoti | Reject with remarks | `REJECTED` |

## 17. Demo Rules: Say / Avoid

| Say | Avoid |
|---|---|
| “Decision-support recommendation” | “The AI approves the loan” |
| “Demo rule configuration” | “Production-ready credit model” |
| “Synthetic data” | Implying records are real customers |
| “Approximately/within 500 meters using geodesic calculation” | “Everyone nearby is risky” |
| “Insufficient data” | Treating missing data as low risk |
| “Evidence-based factor” | “The model just knows” |
| “Human review required” | Suggesting the reviewer is optional |

## 18. Fallback Plan

| Failure | Immediate Action | What to Say |
|---|---|---|
| Login/session issue | Use prepared authenticated tab | “I’ll continue from the prepared role session.” |
| Live GPS blocked | Use visible synthetic GPS fixture | “For this synthetic demo, we use a fixed validated location.” |
| Map does not load | Show area metric/list view | “The analysis is server-side; the map is only visualization.” |
| AI provider timeout | Show validated fallback report | “The deterministic risk engine remains available.” |
| Upload fails | Use preloaded placeholder evidence | “This is synthetic evidence prepared for the demo.” |
| Slow transition | Open next prepared role tab | Continue story; return to timeline later |
| Environment unavailable | Use recording/screenshots | Clearly state it is a backup walkthrough |

Never hide a live failure by claiming it succeeded. Use the documented fallback and continue transparently.

## 19. Likely Judge Questions and Answers

### “Does AI approve or reject the loan?”

No. Deterministic rules calculate risk indicators, AI explains the structured evidence, and only authorized RM users can approve or reject.

### “Why use a 500-meter radius?”

It provides a configurable local portfolio context around a verified location. The MVP uses 500 meters from the product requirement; production use requires business, privacy and risk validation.

### “How do you protect nearby customers?”

The area response exposes aggregates rather than identities. Eligibility, scope and minimum cohort rules are applied on the server.

### “What happens when there are few borrowers nearby?”

The system returns `INSUFFICIENT_DATA`. It does not label the area low risk simply because data is missing.

### “Is the risk model machine learning?”

The MVP uses transparent, versioned weighted rules and statistical indicators. This is easier to explain and validate during the prototype. More advanced models would require formal data, fairness, calibration and governance work.

### “What if the AI hallucinates?”

The model receives structured, minimized inputs and must return a validated schema. Unsupported output is rejected or replaced by a deterministic fallback; AI cannot call the approval workflow.

### “Can a user access another branch’s data?”

The backend checks role, department, organizational scope and assignment on every request. Changing an ID in the browser does not bypass authorization.

### “Does it work offline?”

The MVP supports local draft and reconnect-safe synchronization/idempotent retries. Production-grade offline media queues and conflict UX are part of the hardening roadmap.

### “Can this be production-ready in three days?”

The three-day result is a demo MVP validating the end-to-end concept. Production requires integration, model governance, security/privacy assessment, scale testing, operational controls and a controlled pilot.

## 20. Demo Readiness Checklist

### Data

- [ ] Synthetic dataset reset and verified.
- [ ] Primary Dabi and Progoti applications open correctly.
- [ ] Risk levels and factors match the intended story.
- [ ] GPS boundary and insufficient-data fixtures work.

### System

- [ ] All role sessions ready.
- [ ] Health/readiness checks pass.
- [ ] Browser permissions tested.
- [ ] AI and fallback both tested.
- [ ] No secrets, debug panels or real PII visible.

### Presentation

- [ ] Presenter has rehearsed within 10 minutes.
- [ ] Click sheet is available separately.
- [ ] Backup screenshots/video are ready.
- [ ] Presenter and operator know the fallback cues.
- [ ] Q&A owners are identified for business, architecture and AI.

## 21. Success Criteria

The demo succeeds when the audience can clearly state that:

1. GeoCredit AI combines customer, field and nearby portfolio evidence.
2. Customer risk and area risk are distinct and explainable.
3. Dabi and Progoti follow their correct human approval paths.
4. Only RM can make the final decision.
5. Privacy, uncertainty and AI failure are handled visibly and safely.

