# GeoCredit AI — AI Risk Scoring Rules

**Version:** MVP v1.0  
**Status:** Draft for Business Validation  
**Approach:** Transparent weighted rules + statistical indicators  
**Target:** Hackathon / 3-Day Demo MVP  
**Last Updated:** 03 September 2026

## 1. Purpose

This document defines the MVP risk-scoring rules for GeoCredit AI. The engine produces two separate assessments:

1. **Customer Risk** — risk based on the applicant's financial capacity, loan behavior, savings behavior, social/field assessment and checklist data.
2. **Area Risk** — risk based on eligible borrowers and portfolio behavior within approximately 500 meters of the verified applicant location.

The engine also produces evidence-based positive factors, risk factors, key findings and a suggested action.

> **Mandatory:** The output is advisory. It must display **AI Recommendation — Human Review Required** and must never automatically approve or reject an application.

## 2. Governance Notice

All weights and thresholds in this document are **demo defaults**, not approved production credit policy. Before production use, they require validation and formal approval by Credit Risk, Business, Compliance, Legal/Privacy, Model Risk and relevant operational owners.

The MVP must store:

- Engine version
- Rule configuration version
- Threshold version
- Feature schema version
- Input/application snapshot version
- Data timestamps
- Triggered reason codes
- Score and risk level
- Generated timestamp

## 3. Scoring Model

### 3.1 Score Direction

- Score range: `0–100`
- Higher score means higher observed risk.
- Customer and Area scores remain separate.
- No undisclosed combined score is required for MVP.

### 3.2 Risk Levels

| Score | Risk Level | Display |
|---:|---|---|
| 0–24.99 | `LOW` | Low Risk |
| 25–49.99 | `MODERATE` | Moderate Risk |
| 50–74.99 | `HIGH` | High Risk |
| 75–100 | `VERY_HIGH` | Very High Risk |

These boundaries must be configurable and versioned.

### 3.3 Calculation

Each category produces a normalized risk subscore from `0–100`.

```text
customer_risk_score =
    financial_score       × 0.30
  + loan_behavior_score   × 0.30
  + savings_score         × 0.10
  + social_field_score    × 0.20
  + checklist_score       × 0.10
```

```text
area_risk_score =
    overdue_score         × 0.35
  + repayment_score       × 0.20
  + exposure_score        × 0.15
  + concentration_score   × 0.10
  + risk_distribution     × 0.15
  + area_savings_score    × 0.05
```

Scores are rounded to two decimal places after weighted aggregation.

## 4. Customer Risk Category Weights

| Category | Weight | Required Inputs |
|---|---:|---|
| Financial Capacity | 30% | Income, expenses, liabilities, surplus, proposed installment |
| Loan Behavior | 30% | Previous loans, delays, overdue, missed dates, repayment trend |
| Savings Behavior | 10% | Balance, deposits, withdrawals, consistency and trend |
| Social & Field Assessment | 20% | Social acceptance, family/guarantor, behavior, repayment intent |
| Checklist & Verification | 10% | Required answers, document readiness, assessor differences |

## 5. Financial Features

### 5.1 Derived Values

```text
total_income = sum(valid monthly income items)
total_expense = sum(valid monthly expense items)
available_surplus = total_income - total_expense
debt_adjusted_surplus = available_surplus - recurring_external_debt_payment
installment_burden_ratio = proposed_installment / max(available_surplus, 1)
expense_to_income_ratio = total_expense / max(total_income, 1)
debt_to_income_ratio = recurring_external_debt_payment / max(total_income, 1)
```

If only total debt balance is available rather than monthly debt payment, it must not be treated as a monthly value. Use a separate feature.

### 5.2 Installment Burden Rule

| Ratio | Points | Factor Code |
|---:|---:|---|
| ≤ 0.25 | 5 | `AFFORDABILITY_STRONG` |
| > 0.25 to 0.40 | 25 | `AFFORDABILITY_ACCEPTABLE` |
| > 0.40 to 0.60 | 60 | `AFFORDABILITY_HIGH` |
| > 0.60 | 90 | `AFFORDABILITY_CRITICAL` |
| Surplus ≤ 0 | 100 | `NO_AVAILABLE_SURPLUS` |

### 5.3 Expense-to-Income Rule

| Ratio | Points | Factor Code |
|---:|---:|---|
| ≤ 0.50 | 10 | `EXPENSE_RATIO_LOW` |
| > 0.50 to 0.70 | 35 | `EXPENSE_RATIO_MODERATE` |
| > 0.70 to 0.90 | 70 | `EXPENSE_RATIO_HIGH` |
| > 0.90 | 95 | `EXPENSE_RATIO_CRITICAL` |

### 5.4 External Debt Rule

| Condition | Points | Factor Code |
|---|---:|---|
| No external debt reported | 5 | `NO_EXTERNAL_DEBT_REPORTED` |
| Monthly debt ratio ≤ 0.15 | 25 | `EXTERNAL_DEBT_LOW` |
| > 0.15 to 0.30 | 55 | `EXTERNAL_DEBT_MODERATE` |
| > 0.30 | 85 | `EXTERNAL_DEBT_HIGH` |
| Debt data inconsistent/missing | Missing | `EXTERNAL_DEBT_DATA_MISSING` |

### 5.5 Cash Buffer Rule

```text
cash_buffer_months = monthly_cash_in_hand / max(total_expense, 1)
```

| Buffer | Points | Factor Code |
|---:|---:|---|
| ≥ 1.0 month | 5 | `CASH_BUFFER_STRONG` |
| ≥ 0.5 and < 1.0 | 25 | `CASH_BUFFER_MODERATE` |
| > 0 and < 0.5 | 60 | `CASH_BUFFER_LOW` |
| 0 | 80 | `NO_CASH_BUFFER` |

### 5.6 Financial Category Formula

```text
financial_score =
    installment_burden_points × 0.45
  + expense_ratio_points      × 0.25
  + external_debt_points      × 0.20
  + cash_buffer_points        × 0.10
```

## 6. Loan Behavior Features

### 6.1 Derived Values

```text
delay_rate = delayed_installments / max(scheduled_installments, 1)
missed_date_rate = missed_collection_dates / max(scheduled_collection_dates, 1)
overdue_to_disbursed_ratio = current_overdue / max(total_disbursed, 1)
recent_delay_rate = delayed_installments_last_6_months / max(installments_last_6_months, 1)
```

### 6.2 Delay Rate

| Delay Rate | Points | Factor Code |
|---:|---:|---|
| 0 | 0 | `NO_REPAYMENT_DELAYS` |
| > 0 to 0.10 | 20 | `REPAYMENT_DELAYS_LOW` |
| > 0.10 to 0.25 | 50 | `REPAYMENT_DELAYS_MODERATE` |
| > 0.25 to 0.50 | 75 | `REPAYMENT_DELAYS_HIGH` |
| > 0.50 | 95 | `REPAYMENT_DELAYS_CRITICAL` |

### 6.3 Current Overdue

| Condition | Points | Factor Code |
|---|---:|---|
| No overdue | 0 | `NO_CURRENT_OVERDUE` |
| Ratio ≤ 0.02 | 25 | `CURRENT_OVERDUE_LOW` |
| > 0.02 to 0.10 | 60 | `CURRENT_OVERDUE_MODERATE` |
| > 0.10 | 90 | `CURRENT_OVERDUE_HIGH` |

### 6.4 Repayment Trend

| Trend | Points | Factor Code |
|---|---:|---|
| Improving | 5 | `REPAYMENT_IMPROVING` |
| Stable | 20 | `REPAYMENT_STABLE` |
| Deteriorating | 80 | `REPAYMENT_DETERIORATING` |
| Insufficient history | Missing | `REPAYMENT_TREND_UNAVAILABLE` |

### 6.5 Previous Loan Completion

| Condition | Points | Factor Code |
|---|---:|---|
| Two or more clean closed loans | 0 | `MULTIPLE_LOANS_COMPLETED` |
| One clean closed loan | 10 | `PREVIOUS_LOAN_COMPLETED` |
| Closed with delays/overdue | 45 | `PREVIOUS_LOAN_IRREGULAR` |
| Default/write-off/serious irregularity | 100 | `PREVIOUS_SEVERE_IRREGULARITY` |
| No previous loan | Missing | `NEW_BORROWER_NO_HISTORY` |

### 6.6 Loan Category Formula

```text
loan_behavior_score =
    delay_rate_points          × 0.30
  + current_overdue_points     × 0.30
  + repayment_trend_points     × 0.20
  + completion_history_points  × 0.20
```

## 7. Savings Behavior Features

### 7.1 Derived Values

```text
deposit_month_coverage = months_with_deposit / max(observed_months, 1)
withdrawal_ratio = total_withdrawals / max(total_deposits, 1)
savings_to_installment = current_savings_balance / max(proposed_installment, 1)
```

### 7.2 Savings Consistency

| Deposit Coverage | Points | Factor Code |
|---:|---:|---|
| ≥ 0.80 | 5 | `SAVINGS_HIGHLY_CONSISTENT` |
| ≥ 0.60 and < 0.80 | 25 | `SAVINGS_CONSISTENT` |
| ≥ 0.30 and < 0.60 | 55 | `SAVINGS_INCONSISTENT` |
| < 0.30 | 80 | `SAVINGS_RARE` |

### 7.3 Savings Trend

| Trend | Points | Factor Code |
|---|---:|---|
| Increasing | 5 | `SAVINGS_TREND_INCREASING` |
| Stable | 25 | `SAVINGS_TREND_STABLE` |
| Declining | 70 | `SAVINGS_TREND_DECLINING` |
| Sharp recent withdrawal | 85 | `RECENT_LARGE_WITHDRAWAL` |

### 7.4 Savings Buffer

| Savings / Proposed Installment | Points | Factor Code |
|---:|---:|---|
| ≥ 2.0 | 5 | `SAVINGS_BUFFER_STRONG` |
| ≥ 1.0 and < 2.0 | 25 | `SAVINGS_BUFFER_MODERATE` |
| > 0 and < 1.0 | 60 | `SAVINGS_BUFFER_LOW` |
| 0 | 80 | `NO_SAVINGS_BUFFER` |

### 7.5 Savings Category Formula

```text
savings_score =
    consistency_points × 0.40
  + trend_points       × 0.30
  + buffer_points      × 0.30
```

## 8. Social and Field Assessment

### 8.1 Social Acceptance

Input scale: `1–10`.

```text
social_acceptance_points = (10 - social_acceptance) / 9 × 100
```

| Rating | Interpretation | Example Factor |
|---:|---|---|
| 8–10 | Positive | `SOCIAL_ACCEPTANCE_HIGH` |
| 5–7 | Moderate | `SOCIAL_ACCEPTANCE_MODERATE` |
| 1–4 | Risk | `SOCIAL_ACCEPTANCE_LOW` |

### 8.2 Guarantor Repayment Ability

Input scale: `1–10`.

```text
guarantor_points = (10 - guarantor_ability) / 9 × 100
```

### 8.3 Binary Assessment Points

| Input | Low-Risk Response | Risk Points When Positive/Negative as Applicable |
|---|---|---:|
| Family aware of loan | Yes | No = 70 |
| Borrower aware of conditions | Yes | No = 90 |
| Guarantor informed | Yes | No = 80 |
| Investment sector suitable | Yes | No = 80 |
| Business/project profitable | Yes | No/uncertain = 70 |
| Repayment intention positive | Yes | Negative = 90 |
| Behavior/conduct acceptable | Yes | Negative = 70 |
| Active political involvement | No concern | Concerning involvement = 60, subject to approved policy |

Sensitive or potentially discriminatory factors must receive formal legal/compliance approval before production use. Political involvement must not be used without a documented lawful, relevant and fair policy.

### 8.4 Social/Field Formula

```text
social_field_score = weighted_mean(
  social_acceptance,
  guarantor_ability,
  family_awareness,
  guarantor_awareness,
  sector_suitability,
  repayment_intent,
  behavior_assessment
)
```

Default individual feature weights should be equal unless an approved configuration states otherwise.

## 9. Checklist and Verification Features

### 9.1 Checklist Completion

Incomplete mandatory checklists are primarily workflow blockers, not score penalties.

| Condition | Scoring/Action |
|---|---|
| Required checklist incomplete | Block relevant transition; `CHECKLIST_INCOMPLETE` |
| Required Progoti document missing | Block or warn based on document configuration |
| Required geo evidence invalid | Block submission; do not score |
| Non-mandatory verification concern | Add approved risk points/reason code |

### 9.2 CDO vs BM Assessment Difference

```text
income_variance_percent =
  abs(cdo_total_income - bm_total_income)
  / max(cdo_total_income, bm_total_income, 1)
  × 100
```

| Variance | Points | Factor Code |
|---:|---:|---|
| < 10% | 0 | `ASSESSMENT_VALUES_ALIGNED` |
| 10%–19.99% | 25 | `ASSESSMENT_VARIANCE_LOW` |
| 20%–39.99% | 65 | `ASSESSMENT_VARIANCE_MATERIAL` |
| ≥ 40% | 90 | `ASSESSMENT_VARIANCE_HIGH` |

The same pattern may be used for expense variance. Demo materiality threshold: `20%`.

### 9.3 Checklist Category Formula

```text
checklist_score =
    assessment_variance_points × 0.60
  + approved_warning_points     × 0.40
```

If no secondary assessment exists at the CDO report stage, variance is marked unavailable rather than assigned zero risk.

## 10. Area Risk Features

### 10.1 Cohort Eligibility

Nearby borrowers must:

- Have a valid current/approved location record.
- Be within 500 geodesic meters of the applicant's verified location.
- Exclude the applicant.
- Match approved department/portfolio rules.
- Meet data freshness and consent/privacy requirements.

Persist radius, query time, eligibility-rule version and borrower cohort reference.

### 10.2 Minimum Cohort

Suggested demo rule:

- `n ≥ 5`: calculate normal area risk.
- `1 ≤ n < 5`: label `INSUFFICIENT_AREA_DATA`; show descriptive facts but no confident area score, or apply an approved low-confidence process.
- `n = 0`: show `NO_NEARBY_BORROWERS_FOUND`; do not interpret zero borrowers as low risk.

### 10.3 Overdue Concentration

```text
overdue_borrower_ratio = borrowers_with_current_overdue / eligible_borrowers
```

| Ratio | Points | Factor Code |
|---:|---:|---|
| ≤ 0.05 | 5 | `AREA_OVERDUE_LOW` |
| > 0.05 to 0.15 | 30 | `AREA_OVERDUE_MODERATE` |
| > 0.15 to 0.30 | 65 | `AREA_OVERDUE_HIGH` |
| > 0.30 | 90 | `AREA_OVERDUE_CONCENTRATION` |

### 10.4 Repayment Delay Concentration

```text
delayed_borrower_ratio = borrowers_with_recent_delay / eligible_borrowers
```

Use the same default boundaries as overdue concentration, with factor codes:

- `AREA_REPAYMENT_STABLE`
- `AREA_REPAYMENT_DELAY_MODERATE`
- `AREA_REPAYMENT_DELAY_HIGH`
- `AREA_REPAYMENT_DELAY_CRITICAL`

### 10.5 Exposure Pressure

For MVP, normalize area outstanding exposure against an approved branch/portfolio benchmark.

```text
exposure_index = area_outstanding_per_borrower / benchmark_outstanding_per_borrower
```

| Index | Points | Factor Code |
|---:|---:|---|
| ≤ 0.75 | 10 | `AREA_EXPOSURE_LOW` |
| > 0.75 to 1.25 | 35 | `AREA_EXPOSURE_NORMAL` |
| > 1.25 to 1.75 | 65 | `AREA_EXPOSURE_ELEVATED` |
| > 1.75 | 90 | `AREA_EXPOSURE_HIGH` |

If a benchmark is unavailable for the demo, use a clearly labeled seeded benchmark, not an invented dynamic value.

### 10.6 Borrower Concentration

Borrower count alone is not automatically risky. For MVP, use concentration only when an approved density benchmark exists.

```text
concentration_index = borrower_count / approved_local_density_benchmark
```

Without a benchmark, assign missing status and show borrower count descriptively.

### 10.7 Risk Distribution

```text
high_risk_share = (high_count + very_high_count) / eligible_borrowers
very_high_risk_share = very_high_count / eligible_borrowers
```

| High + Very High Share | Points | Factor Code |
|---:|---:|---|
| ≤ 0.10 | 5 | `AREA_RISK_DISTRIBUTION_LOW` |
| > 0.10 to 0.25 | 35 | `AREA_RISK_DISTRIBUTION_MODERATE` |
| > 0.25 to 0.50 | 70 | `AREA_RISK_DISTRIBUTION_HIGH` |
| > 0.50 | 95 | `AREA_RISK_DISTRIBUTION_CRITICAL` |

Avoid circularity: area borrower risk must come from a prior approved snapshot or independent historical features, not from the applicant's current report.

### 10.8 Area Savings Behavior

| Condition | Points | Factor Code |
|---|---:|---|
| Consistent/increasing for most borrowers | 10 | `AREA_SAVINGS_STABLE` |
| Mixed behavior | 40 | `AREA_SAVINGS_MIXED` |
| Declining/large withdrawals concentrated | 75 | `AREA_SAVINGS_WEAK` |
| Insufficient data | Missing | `AREA_SAVINGS_DATA_MISSING` |

## 11. Missing Data Handling

Missing data must never silently receive zero risk.

### 11.1 Category Coverage

```text
category_coverage = available_configured_weight / total_configured_weight
```

Rules:

- Reweight only within a category when coverage is at least `60%`.
- If category coverage is below `60%`, mark the category `INSUFFICIENT_DATA`.
- If total customer weight coverage is below `70%`, do not produce a confident customer risk level.
- If the area cohort is below the minimum, mark area risk `INSUFFICIENT_AREA_DATA`.
- Always list material missing inputs in the report.

### 11.2 Reweighting

```text
adjusted_feature_weight = original_weight / sum(available_feature_weights)
```

The output must include `coveragePercent`, `missingFeatures` and any reweighting performed.

### 11.3 Data Freshness

Suggested demo defaults:

| Data | Freshness Warning | Stale/Block Policy |
|---|---|---|
| Customer profile | > 180 days | Warn; confirm before submission |
| Loan transactions | > 30 days | Warn/block per integration expectation |
| Savings transactions | > 30 days | Warn |
| GPS capture | > 24 hours before submission | Warn/recapture by policy |
| Area query | > 24 hours | Regenerate before submission |
| Risk report | Application data changed | Always regenerate |

## 12. Hard Stops vs Risk Factors

Hard stops are workflow validations, not high scores.

| Condition | Behavior |
|---|---|
| Missing/invalid GPS | Block submission |
| Missing house/business image | Block submission |
| Required checklist incomplete | Block relevant transition |
| Invalid financial value | Block submission |
| Risk report not generated | Block submission |
| Unauthorized role/state | Reject action |
| High/very-high risk | Do not block automatically; require human review |
| Insufficient data | Display limitations and follow approved review policy |

## 13. Reason Code Contract

Every factor must include:

```json
{
  "factorCode": "AFFORDABILITY_HIGH",
  "label": "High installment burden",
  "direction": "RISK",
  "severity": "HIGH",
  "observedValue": 0.52,
  "comparison": {
    "operator": ">",
    "threshold": 0.40
  },
  "sourceEntity": "financial_assessment",
  "sourceTimestamp": "2026-09-03T10:20:00Z",
  "evidenceText": "The proposed installment is 52% of available monthly surplus."
}
```

Reason text must be generated from the actual observed value and configured comparison.

## 14. Core Reason Code Catalog

### 14.1 Positive

| Code | Meaning |
|---|---|
| `AFFORDABILITY_STRONG` | Installment is low relative to available surplus |
| `EXPENSE_RATIO_LOW` | Expenses consume a low share of income |
| `CASH_BUFFER_STRONG` | Cash buffer is relatively strong |
| `MULTIPLE_LOANS_COMPLETED` | Multiple previous loans completed successfully |
| `PREVIOUS_LOAN_COMPLETED` | Previous loan completed successfully |
| `NO_CURRENT_OVERDUE` | No current overdue observed |
| `REPAYMENT_IMPROVING` | Recent repayment trend is improving |
| `SAVINGS_HIGHLY_CONSISTENT` | Savings activity is highly consistent |
| `SAVINGS_TREND_INCREASING` | Savings trend is increasing |
| `SOCIAL_ACCEPTANCE_HIGH` | High social acceptance assessment |
| `ASSESSMENT_VALUES_ALIGNED` | Field assessments are materially aligned |
| `AREA_OVERDUE_LOW` | Low overdue concentration nearby |
| `AREA_REPAYMENT_STABLE` | Stable nearby repayment performance |

### 14.2 Risk/Warning

| Code | Meaning |
|---|---|
| `NO_AVAILABLE_SURPLUS` | Expenses equal/exceed income |
| `AFFORDABILITY_HIGH` | Installment burden is high |
| `AFFORDABILITY_CRITICAL` | Installment burden is critical |
| `EXPENSE_RATIO_HIGH` | Expense-to-income ratio is high |
| `EXTERNAL_DEBT_HIGH` | External debt burden is high |
| `NO_CASH_BUFFER` | No monthly cash buffer reported |
| `REPAYMENT_DELAYS_HIGH` | High historical delay rate |
| `CURRENT_OVERDUE_HIGH` | Current overdue is high |
| `REPAYMENT_DETERIORATING` | Recent repayment trend is deteriorating |
| `PREVIOUS_SEVERE_IRREGULARITY` | Prior default/write-off/serious issue |
| `SAVINGS_TREND_DECLINING` | Savings balance/activity is declining |
| `RECENT_LARGE_WITHDRAWAL` | Recent large withdrawal observed |
| `SOCIAL_ACCEPTANCE_LOW` | Low social acceptance assessment |
| `ASSESSMENT_VARIANCE_MATERIAL` | CDO/BM values differ materially |
| `AREA_OVERDUE_CONCENTRATION` | High nearby overdue concentration |
| `AREA_REPAYMENT_DELAY_HIGH` | High nearby delay concentration |
| `AREA_EXPOSURE_HIGH` | High exposure against benchmark |
| `AREA_RISK_DISTRIBUTION_HIGH` | High share of nearby high-risk borrowers |

### 14.3 Data Quality

| Code | Meaning |
|---|---|
| `NEW_BORROWER_NO_HISTORY` | No previous loan history |
| `REPAYMENT_TREND_UNAVAILABLE` | Insufficient repayment observations |
| `SAVINGS_DATA_MISSING` | Savings history unavailable |
| `EXTERNAL_DEBT_DATA_MISSING` | External debt information incomplete |
| `INSUFFICIENT_AREA_DATA` | Nearby cohort below minimum |
| `NO_NEARBY_BORROWERS_FOUND` | Valid query found no eligible borrowers |
| `STALE_LOAN_DATA` | Loan history exceeds freshness threshold |
| `STALE_SAVINGS_DATA` | Savings history exceeds freshness threshold |

## 15. Suggested Action Rules

### 15.1 Base Mapping

| Condition | Suggested Action Code | Text |
|---|---|---|
| Customer Low + Area Low | `NORMAL_REVIEW` | Proceed with normal review. |
| Any Moderate, none High/Very High | `ATTENTION_REQUIRED` | Proceed with additional attention to identified factors. |
| Customer High or Area High | `ADDITIONAL_REVIEW` | Additional verification/review recommended. |
| Customer Very High or Area Very High | `ENHANCED_REVIEW` | Enhanced review recommended before proceeding. |
| Insufficient critical data | `DATA_VERIFICATION_REQUIRED` | Verify missing or stale information before proceeding. |

### 15.2 Priority

```text
DATA_VERIFICATION_REQUIRED overrides normal risk mapping when confidence is insufficient.
Otherwise, use the more cautious action implied by Customer Risk or Area Risk.
```

Suggested action is not an approval decision.

## 16. Key Finding Generation

The report builder should select:

- Up to 3 highest-severity customer risk factors
- Up to 3 highest-severity area risk factors
- Up to 3 strongest positive factors
- Material customer/area contrast
- Missing/stale data limitation

Example contrast templates:

| Condition | Finding Template |
|---|---|
| Customer lower than area | The customer shows relatively stronger individual indicators, while the surrounding area has elevated risk. |
| Area lower than customer | The surrounding area is relatively stable, while the customer has material individual risk indicators. |
| Both high | Both customer-level and area-level information contain elevated risk indicators. |
| Both low | Available customer and area indicators are relatively stable; normal human review remains required. |
| Insufficient area data | Area risk could not be assessed confidently because too few eligible nearby borrowers were available. |

LLM use, if enabled, may rephrase approved structured findings only. It cannot add facts, scores or decisions.

## 17. Example Customer Calculation

Assume:

| Category | Subscore | Weight | Contribution |
|---|---:|---:|---:|
| Financial | 55 | 0.30 | 16.50 |
| Loan Behavior | 40 | 0.30 | 12.00 |
| Savings | 20 | 0.10 | 2.00 |
| Social/Field | 35 | 0.20 | 7.00 |
| Checklist | 45 | 0.10 | 4.50 |
| **Total** |  |  | **42.00** |

Result:

```json
{
  "score": 42,
  "level": "MODERATE"
}
```

## 18. Example Area Calculation

Assume 12 eligible nearby borrowers:

| Category | Subscore | Weight | Contribution |
|---|---:|---:|---:|
| Overdue Concentration | 80 | 0.35 | 28.00 |
| Repayment Delay | 70 | 0.20 | 14.00 |
| Exposure | 60 | 0.15 | 9.00 |
| Concentration | 40 | 0.10 | 4.00 |
| Risk Distribution | 75 | 0.15 | 11.25 |
| Savings | 35 | 0.05 | 1.75 |
| **Total** |  |  | **68.00** |

Result:

```json
{
  "score": 68,
  "level": "HIGH"
}
```

Combined report message:

```text
Customer Risk: MODERATE (42)
Area Risk: HIGH (68)
Suggested Action: Additional verification/review recommended.
AI Recommendation — Human Review Required
```

## 19. Configuration Example

```json
{
  "engineVersion": "rules-1.0.0",
  "ruleConfigVersion": "risk-rules-demo-1",
  "thresholdVersion": "risk-thresholds-demo-1",
  "featureSchemaVersion": "features-1.0",
  "riskLevels": {
    "LOW": [0, 25],
    "MODERATE": [25, 50],
    "HIGH": [50, 75],
    "VERY_HIGH": [75, 100.01]
  },
  "customerWeights": {
    "financial": 0.30,
    "loanBehavior": 0.30,
    "savings": 0.10,
    "socialField": 0.20,
    "checklist": 0.10
  },
  "areaWeights": {
    "overdue": 0.35,
    "repayment": 0.20,
    "exposure": 0.15,
    "concentration": 0.10,
    "riskDistribution": 0.15,
    "savings": 0.05
  },
  "minimumCoverage": {
    "featureCategory": 0.60,
    "customerOverall": 0.70,
    "areaBorrowerCount": 5
  }
}
```

Configuration changes require a new version; never edit historical configuration referenced by a report.

## 20. Determinism and Reproducibility

For the same:

- Application snapshot
- Feature schema/version
- Area borrower cohort/data cutoff
- Rule configuration
- Threshold configuration

the scoring engine must produce the same structured scores and reason codes.

The narrative layer may change wording only if its version changes. Structured facts remain authoritative.

## 21. Testing Requirements

### 21.1 Unit Tests

- Every threshold boundary, including exact equality
- Zero/negative surplus
- No previous loan history
- No savings history
- Missing external debt data
- CDO/BM assessment variance
- Minimum area cohort boundary
- Applicant exclusion from cohort
- Customer and area level mapping
- Suggested-action priority
- Missing-data reweighting
- Score clamping and rounding

### 21.2 Golden Tests

Maintain fixed input/output fixtures for:

1. Low customer / low area
2. Moderate customer / high area
3. High customer / low area
4. Very-high customer / high area
5. New borrower with insufficient history
6. Insufficient nearby cohort
7. Material CDO/BM income variance
8. Stale history data

Golden tests verify scores, risk levels, factor codes, evidence values, action code and version metadata.

## 22. Monitoring Requirements

- Score distribution by engine/rule version
- Risk-level distribution
- Missing-feature rate
- Area insufficient-data rate
- Most frequent positive/risk factor codes
- Human final decision versus suggested-action patterns
- Score changes between rule versions
- Processing failures and latency
- Group-level outcome/performance review using approved fairness dimensions

Monitoring is for governance and model improvement, not automated adverse action.

## 23. Prohibited Behavior

- Automatically approving or rejecting a loan
- Using a factor without approved business definition
- Assigning zero risk to missing data
- Combining customer and area risk into one unexplained score
- Inventing factor evidence or numeric values
- Changing a historical report after configuration/data changes
- Using sensitive/protected attributes without legal, fairness and business approval
- Exposing nearby borrowers' personal data in risk explanations
- Allowing the LLM to override structured scores or reason codes

## 24. Business Decisions Required

- Final category and feature weights
- Risk-level thresholds
- Approved affordability/tolerance formula
- Treatment of new borrowers with no history
- External debt definitions
- Area cohort eligibility
- Minimum area cohort size
- Area exposure/density benchmarks
- Checklist/document block versus warning rules
- GPS accuracy and freshness policy
- Permitted social/field factors
- Approved fairness and monitoring approach
- Explanation generation method and approval process

## 25. Acceptance Criteria

- Engine returns separate Customer Risk and Area Risk scores.
- Scores are within 0–100 and map to versioned levels.
- Every score contribution comes from a documented feature/rule.
- Every displayed factor contains observed evidence and a reason code.
- Missing data is reported and never silently assigned zero risk.
- Insufficient area cohort is distinguished from low area risk.
- Applicant is excluded from the 500-meter cohort.
- Customer/area conflict remains visible in the report.
- Suggested action uses the configured cautious mapping.
- High/very-high risk does not automatically reject an application.
- Output always states that human review is required.
- Historical report stores application, data, engine, rule and threshold versions.
- Same snapshot/configuration produces the same structured output.
- LLM narrative cannot change scores, factors or workflow state.
- Boundary, missing-data, golden and authorization tests pass.

