# Demo Client Score v1

Version: demo-client-v1. Higher means better. This is synthetic decision support, not approved credit policy or a repayment guarantee. Always show **AI Recommendation — Human Review Required**.

Weights: Income Source 50%, Social Acceptance 10%, Transaction History 20%, Savings 10%, House Infrastructure 10%.

Income Source: available monthly income after expenses and monthly debt payments divided by income, multiplied by 200 and capped at 100, contributes 80% of the category. Stability contributes 20% (stable 100, seasonal 60, irregular 20). Complete zero-income facts score zero, not missing. Debt input means monthly payments, not total debt balance.

Social Acceptance: rating 1–10 maps linearly to 0–100. All required human observations must be entered explicitly, never preselected as favorable.

Transaction History: server portfolio facts only. Fully collected schedule proportion contributes 70%; overdue/principal contributes 30%, linearly decreasing from 100 at no overdue to zero at 20% overdue. No recorded schedules or no positive principal means incomplete, not a perfect thin-file score. Existing collection rows are treated as schedule records for this demo; production ERP mapping needs business validation.

Savings: latest recorded savings balance divided by three proposed monthly installments, capped at 100. No savings record means incomplete; a recorded zero balance means zero. Installment comes from the saved financial assessment.

House Infrastructure: structure (durable 100, semi-durable 60, temporary 20) contributes 50%; condition (good 100, fair 60, poor 20) contributes 40%; observed basic utilities (yes 100, no 0) contributes 10%.

All monetary inputs are decimal strings with at most two fractional digits. Calculations use integer fixed point. Category scores round half-up to two decimals; weighted contributions retain four decimal places. The aggregate rounds once to two decimals, then classifies: >=80 RISK_FREE_LOAN, >=60 REVIEW_REQUIRED, otherwise HIGHER_RISK. “Risk-Free Loan” is only a recommendation label and must appear with the disclaimer and no-guarantee warning. Any missing category yields null total and INCOMPLETE; weights are never redistributed.

CDO and BM append separate immutable assessments. Portfolio facts and calculation time/rule are stored with every revision. AM/RM see both; the latest complete BM assessment is the canonical reviewer result. Incomplete newer drafts remain visible and block BM recommendation.

Required checklist codes for Dabi submission/recommendation: IDENTITY_VERIFIED, EVIDENCE_REVIEWED, FINANCIALS_CONFIRMED. Required image in this phase means the completed private HOUSE evidence attached to server-confirmed GPS. Private member-portrait retrieval remains a separate media phase.

GPS rule demo-gps-v1 is database-configured and immutable: accuracy <=100m, age <=1800 seconds, future clock tolerance <=30 seconds. Change policy by adding a new version, not editing existing records. CDO submission requires fresh GPS and complete financial/checklist/scoring data. BM recommendation requires fresh evidence verification, its own complete checklist and score, and the preserved CDO submission package. Existing historical scores remain LEGACY/UNVERSIONED; no historical data is fabricated or reclassified.
