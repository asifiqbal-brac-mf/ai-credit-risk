 

**PRODUCT REQUIREMENTS DOCUMENT**

**GeoCredit AI**

*AI-Powered Area Risk Intelligence, Customer Credit Assessment & Geo-Verification*

 

| Item | Details |
| :---- | :---- |
| Product Name | GeoCredit AI |
| Version | MVP v1.0 |
| Product Category | Financial Inclusion for Rural and Hard-to-Reach Communities |
| Primary Platform | Android Application \+ Web Portal |
| Android Users | CDO, CO, BM |
| Web Portal Users | AM, RM |
| Departments | Dabi & Progoti |
| Core Capabilities | Geo-Verification, Area Risk Intelligence, Customer Risk Assessment, AI Report, Loan Workflow |
| Primary Objective | Support better loan decisions using customer, financial, behavioral, checklist and geographical intelligence |
| Document Status | Draft for Review |

 

# **Table of Contents**

**Table of Contents**.................................................................................................................................. 1

**1\. Executive Summary**............................................................................................................................ 1

**2\. Product Vision**................................................................................................................................... 1

**3\. Problem Statement**............................................................................................................................ 1

**4\. MVP Objective**................................................................................................................................... 1

**5\. MVP Goals**........................................................................................................................................ 1

**6\. MVP Users and Platforms**................................................................................................................... 1

**7\. Platform Requirements**...................................................................................................................... 1

**7.1 Android Application**...................................................................................................................... 1

**7.2 Web Portal**................................................................................................................................... 1

**8\. Authentication**.................................................................................................................................. 1

**8.1 CDO Login**.................................................................................................................................... 1

**8.2 CO Login**...................................................................................................................................... 1

**8.3 BM Login**..................................................................................................................................... 1

**8.4 AM/RM Web Login**....................................................................................................................... 1

**9\. Customer Profile**................................................................................................................................ 1

**10\. Customer Profile Fields**..................................................................................................................... 1

**11\. Profile Modules**............................................................................................................................... 1

**12\. Loan Behavior**.................................................................................................................................. 1

**12.1 Loan-Level Information (Example)**................................................................................................ 1

**13\. Loan Transaction History**.................................................................................................................. 1

**14\. Loan Behavior Summary**................................................................................................................... 1

**15\. Savings Behavior**.............................................................................................................................. 1

**16\. Savings Behavior Summary**............................................................................................................... 1

**17\. Dabi Loan Application**....................................................................................................................... 1

**18\. Dabi Loan Application Fields**............................................................................................................. 1

**19\. Dabi Monthly Income**....................................................................................................................... 1

**20\. Dabi Monthly Expense**...................................................................................................................... 1

**21\. Dabi Liabilities**................................................................................................................................. 1

**22\. Dabi Residence Information**.............................................................................................................. 1

**23\. Dabi BM Checklist**............................................................................................................................ 1

**24\. Dabi AM Checklist**............................................................................................................................ 1

**25\. Income and Expense Assessment**....................................................................................................... 1

**26\. Dabi Geo-Verification**....................................................................................................................... 1

**27\. Dabi GPS Validation**.......................................................................................................................... 1

**28\. 500-Meter Area Intelligence**.............................................................................................................. 1

**29\. Area Report**..................................................................................................................................... 1

**30\. Individual Customer Report**.............................................................................................................. 1

**31\. AI Report**......................................................................................................................................... 1

**32\. AI Report Example**............................................................................................................................ 1

**33\. Dabi CDO Submission Workflow**........................................................................................................ 1

**34\. Dabi BM Workflow**........................................................................................................................... 1

**35\. Dabi BM Location Rule**...................................................................................................................... 1

**36\. Dabi BM Decision**............................................................................................................................. 1

**37\. Dabi AM Workflow**........................................................................................................................... 1

**38\. Dabi RM Workflow**........................................................................................................................... 1

**39\. Progoti Profile**.................................................................................................................................. 1

**40\. Progoti Loan Application**................................................................................................................... 1

**41\. Progoti Loan Information**.................................................................................................................. 1

**42\. Progoti Income Information**.............................................................................................................. 1

**43\. Progoti Expense Information**............................................................................................................. 1

**44\. Progoti Tolerance**............................................................................................................................. 1

**45\. Progoti Checklist**.............................................................................................................................. 1

**46\. Progoti Document Checklist**.............................................................................................................. 1

**47\. Progoti CO Remarks**.......................................................................................................................... 1

**48\. Progoti Loan Assessment Checklist**.................................................................................................... 1

**49\. Progoti Geo-Verification**................................................................................................................... 1

**50\. Progoti Area Intelligence**................................................................................................................... 1

**51\. Progoti CO Submission**...................................................................................................................... 1

**52\. Progoti AM Workflow**....................................................................................................................... 1

**53\. Progoti RM Workflow**....................................................................................................................... 1

**54\. Unified Risk Intelligence**................................................................................................................... 1

**55\. AI Input Categories**........................................................................................................................... 1

**56\. AI Report Components**..................................................................................................................... 1

**57\. Risk Scoring**..................................................................................................................................... 1

**58\. Explainable AI Requirement**.............................................................................................................. 1

**59\. Suggested Action**............................................................................................................................. 1

**60\. Risk Report During Workflow**............................................................................................................ 1

**61\. Risk Snapshot**.................................................................................................................................. 1

**62\. Area Borrower Display**...................................................................................................................... 1

**63\. Map View**........................................................................................................................................ 1

**64\. Offline Requirements**....................................................................................................................... 1

**65\. GPS/Image Data Requirements**......................................................................................................... 1

**66\. Important GPS Validation Rule**.......................................................................................................... 1

**67\. Application Status**............................................................................................................................ 1

**68\. Role-Based Permissions**.................................................................................................................... 1

**69\. Core Database Entities**...................................................................................................................... 1

**70\. Audit Trail**....................................................................................................................................... 1

**71\. Security Requirements**...................................................................................................................... 1

**72\. Privacy Requirements**....................................................................................................................... 1

**73\. AI Safety and Human Decision Requirement**....................................................................................... 1

**74\. Functional Requirement Summary**..................................................................................................... 1

**75\. MVP Acceptance Criteria — Dabi**....................................................................................................... 1

**76\. MVP Acceptance Criteria — Progoti**................................................................................................... 1

**77\. MVP Demo Story**.............................................................................................................................. 1

**78\. MVP Non-Goals**................................................................................................................................ 1

**79\. Future Enhancements**....................................................................................................................... 1

**80\. Product Success Metrics**................................................................................................................... 1

**81\. MVP Definition of Done**.................................................................................................................... 1

**Android Application**........................................................................................................................... 1

**Web Portal**........................................................................................................................................ 1

**Backend**............................................................................................................................................ 1

**82\. Final MVP Product Definition**............................................................................................................ 1

**83\. One-Line MVP Value Proposition**....................................................................................................... 1

 

 

# **1\. Executive Summary**

GeoCredit AI is an AI-powered decision-support platform designed for microfinance operations in rural and hard-to-reach communities. The MVP combines customer-level information and location-level information to provide a comprehensive risk assessment before a loan application progresses through the approval hierarchy.

The system maintains two distinct but interconnected perspectives:

### **Individual Customer Intelligence**

The customer's loan and savings behavior, financial information, previous repayment behavior, checklist information and other customer-level indicators are analyzed to understand the customer's risk.

### **Area Intelligence**

The customer's verified house/business location is used to identify other relevant borrowers within approximately 500 meters. Available loan, savings, financial and risk information from that surrounding area is analyzed to understand geographical risk.

### **Factors Considered by the AI Engine**

•      Income, expenses, and liabilities

•      Proposed loan amount

•      Loan and savings behavior

•      Repayment history

•      Social acceptance

•      Checklist information

•      Customer behavior

•      Area-level customer concentration

•      Historical loan performance

•      Other relevant available information

### **Resulting Report**

•      Individual Customer Risk Assessment

•      Area Risk Assessment

•      Key Risk Factors

•      Positive Indicators

•      Warning Indicators

•      Suggested Action

### **Supported Organizational Workflows**

**Dabi:  CDO → BM → AM → RM**

**Progoti:  CO → AM → RM**

*The final loan decision remains with the responsible organizational authority. GeoCredit AI acts as an AI-powered decision-support system, not an autonomous loan approval system.*

# **2\. Product Vision**

### **Vision Statement**

*To make rural financial decisions smarter by connecting who the customer is, where the customer is, what happened there before, and what is happening now.*

GeoCredit AI aims to convert scattered customer records, geographical information, historical behavior and field-level observations into actionable risk intelligence.

# **3\. Problem Statement**

Microfinance operations depend heavily on field-level knowledge. An experienced CDO or CO may personally understand customer behavior, local repayment patterns, area-specific risks, previous incidents, business conditions, social acceptance, and customer relationships.

However, this knowledge is difficult to transfer when employees join a new area, transfer to another branch, replace another employee, review unfamiliar customers, or move between locations. Similarly, supervisors may need to evaluate loan applications without direct knowledge of the customer's location or historical surrounding-area behavior.

A customer's individual history and the surrounding area's history can also tell different stories. For example, a customer with a good repayment history, stable income, and good social acceptance may still be located in an area with high historical overdue rates. Conversely, a customer with poor repayment behavior may be located in an area that has historically low risk.

Therefore, GeoCredit AI separates the two perspectives:

*Customer Risk \= What do we know about this customer? Area Risk \= What do we know about this location and surrounding borrowers?*

# **4\. MVP Objective**

The MVP will prove the following complete business process:

*Customer Profile → Geo-Verification → Loan Application → Customer & Area Data Analysis → AI Risk Report → CDO/CO Submission → Supervisor Review → Recommendation / Approval / Reject*

The MVP must demonstrate that relevant historical and current data can be transformed into a useful AI-generated report before a loan decision.

# **5\. MVP Goals**

### **Goal 1 — Customer Digital Profile**

Create a structured customer profile containing relevant personal, organizational and financial information.

### **Goal 2 — Geo-Verification**

Capture and validate the customer's house/business location using an image containing GPS information.

### **Goal 3 — Behavioral Intelligence**

Make historical loan and savings behavior available to CDO, CO, BM, AM and RM.

### **Goal 4 — Area Intelligence**

Identify relevant borrowers within approximately 500 meters of the customer's verified location.

### **Goal 5 — AI Risk Assessment**

Analyze customer and surrounding-area information and generate an understandable risk report.

### **Goal 6 — Decision Workflow**

Integrate the risk report into the Dabi and Progoti loan approval workflows.

# **6\. MVP Users and Platforms**

| Role | Department | Platform | Main Functions |
| :---- | :---- | :---- | :---- |
| CDO | Dabi | Android | Profile, loan application, geo-verification, AI report, submission |
| BM | Dabi | Android | Review application, review AI report, checklist, recommendation |
| CO | Progoti | Android | Profile, loan application, geo-verification, AI report, submission |
| AM | Dabi & Progoti | Web | Review application, checklist, AI report, recommendation |
| RM | Dabi & Progoti | Web | Final review, AI report, approve/reject |

# **7\. Platform Requirements**

## **7.1 Android Application**

Used by CDO, CO, and BM. The application should be optimized for field operations.

### **Primary Characteristics**

•      Simple interface

•      GPS support

•      Camera support

•      Offline-capable GPS/photo capture

•      Customer profile

•      Loan application

•      Risk report

•      Workflow management

## **7.2 Web Portal**

Used by AM and RM. Provides:

•      Application monitoring

•      Customer information

•      Loan behavior

•      Savings behavior

•      Geo-location

•      Surrounding borrower information

•      AI risk report

•      Checklist

•      Recommendation / approval / rejection

# **8\. Authentication**

## **8.1 CDO Login**

The CDO logs in using their PIN / employee credential (example: 1547800). The system identifies the CDO's employee identity, branch, area, region, division, and department/project based on the authenticated account.

## **8.2 CO Login**

CO authentication follows the organization's assigned credentials. The system associates the CO with branch, area, region, department, and relevant organizational information.

## **8.3 BM Login**

BM authenticates using their assigned organizational credentials.

## **8.4 AM/RM Web Login**

AM and RM authenticate through the web portal. The system determines whether the user belongs to Dabi or Progoti and displays the appropriate applications and workflows.

# **9\. Customer Profile**

The profile is the foundation of GeoCredit AI. It is created/updated by the field-level user — primarily the CDO for Dabi, and also the CO for Progoti.

# **10\. Customer Profile Fields**

### **Organizational Information**

•      Branch Code

•      Area

•      Region

•      Division

•      Project — Dabi

•      VO

•      Member No

### **Personal Information**

•      Member Name

•      Date of Birth

•      Mother's Name

•      Father's Name

•      Gender

•      Marital Status

•      Spouse Name

### **Identification**

•      ID Type

•      Member Category

•      Spouse NID Type / No

•      Nominee NID Type / No

### **Customer Information**

•      Occupation

•      Present Address

•      Permanent Address

•      Primary Earner

### **Spouse Information**

•      Spouse Name, NID Type/No, Date of Birth, Occupation

### **Nominee Information**

•      Nominee Name, NID Type/No, Date of Birth, Relationship

# **11\. Profile Modules**

| Module | Description |
| :---- | :---- |
| Basic Profile | Personal and organizational information |
| Loan Behavior | Previous loan and repayment history |
| Savings Behavior | Previous savings transactions and balance history |
| Geo Information | Verified house/business location |
| Loan Applications | Current and historical loan applications |

# **12\. Loan Behavior**

The system must allow authorized users to view the customer's previous loan behavior, containing both loan-level information and transaction/installment-level information.

## **12.1 Loan-Level Information (Example)**

| Field | Example |
| :---- | :---- |
| Disburse Date | 28-10-2024 |
| PO | MD. Habibur Rahaman (00290074) |
| Disbursed Amount | 60,000 |
| Member Name | Mst Hira Khatun |
| Loan Serial No | 1 |
| Loan Status | Closed |
| Number of Installment | 12 |

# **13\. Loan Transaction History**

The system should display relevant historical transaction information.

### **Fields**

•      Transaction Serial

•      Collection Date

•      Target Amount

•      Collection Amount

•      Loan Due

•      Over Due

•      Is Collection Date

•      Loan Status

•      Collection Method

### **Example**

| Txn | Collection Date | Target | Collection | Overdue | Status | Method |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | 2024-11-21 | 0 | 6,000 | 0 | Current | Cash |
| 2 | 2024-12-02 | 5,700 | 0 | 0 | Current | Cash |
| 3 | 2024-12-26 | 0 | 6,000 | 0 | Current | Cash |
| … | … | … | … | … | … | … |
| 26 | 2025-11-19 | 0 | 5,171 | 0 | L-1 | Journal |

*The MVP does not need to reproduce every historical transaction directly on the dashboard. A summary plus expandable transaction history can be used.*

# **14\. Loan Behavior Summary**

The system should calculate useful summary indicators from the transaction history — these become inputs for the AI assessment:

•      Total previous loans

•      Closed loans

•      Active loans

•      Total disbursed amount

•      Total overdue amount

•      Number of delayed installments

•      Number of missed collection dates

•      Maximum overdue

•      Average collection performance

•      Previous loan repayment trend

# **15\. Savings Behavior**

The customer profile will also include savings behavior.

### **Required Fields**

•      Transaction Date

•      Savings Own

•      Collection Security

•      Withdrawal

•      Savings Balance

•      Mode of Payment

### **Example**

| Date | Savings Own | Security | Withdrawal | Balance | Payment |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 2024-02-07 | 5 | 0 | 0 | 5 | Cash |
| 2024-10-27 | 5,000 | 0 | 0 | 5,005 | Cash |
| 2024-11-21 | 500 | 0 | 0 | 5,505 | Cash |
| 2025-11-19 | 0 | 0 | 0 | 1,083 | Bkash |
| 2026-08-27 | 4,000 | 0 | 0 | 5,270 | Cash |

# **16\. Savings Behavior Summary**

The AI engine can derive: current savings balance, savings trend, frequency of deposits, withdrawal frequency, large withdrawal events, payment method pattern, and savings consistency. Savings information should contribute to the overall customer assessment where applicable.

# **17\. Dabi Loan Application**

From the customer profile, the CDO can initiate a new loan application. Existing profile information should automatically populate relevant fields — the CDO should not need to re-enter information that already exists in the customer profile.

# **18\. Dabi Loan Application Fields**

### **Basic Loan Information**

•      Proposed Amount

•      Loan User

•      Loan Type — New / Repeat

•      Loan Duration (Months)

•      Investment Sector

•      Scheme

•      Loan Product

# **19\. Dabi Monthly Income**

Captures: Primary Earner Regular Income, Alternative Income, Remittances, House Rent, Other Household Income, Spouse/Children Income. The system calculates Total Monthly Income where applicable.

# **20\. Dabi Monthly Expense**

Captures: House Rent & Utility Bill, Food Expenses, Education Expenses, Medical Treatment, Other Expenses. The system calculates Total Monthly Expense.

# **21\. Dabi Liabilities**

Captures: Debt from Other Sources, Monthly Cash in Hand, Installment of Proposed Loan, Tolerance Limit (%). The system calculates relevant affordability indicators.

# **22\. Dabi Residence Information**

Captures: Residence Type.

# **23\. Dabi BM Checklist**

The BM is responsible for completing the BM Checklist, including:

1\.    How many children?

2\.    Number of earning members in the family

3\.    Duration

4\.    Does the member own the home?

5\.    Is the landlord aware of the loan?

6\.    Is the loan requirement and recommended loan amount consistent?

7\.    Has the family's main earner recently changed occupation?

8\.    Is the member/husband/father/mother/adult child aware of the loan?

9\.    Has consent been obtained by directly discussing the responsibilities and duties of the guarantor after verifying the moral and social acceptability of the guarantor?

10\.         Social acceptance (1–10)

11\.         Guarantor repayment ability (1–10)

12\.         BM Remarks

# **24\. Dabi AM Checklist**

The AM completes the AM Checklist, including:

13\.         Has the member taken a loan from another institution?

14\.         Current monthly income from the proposed investment sector

15\.         Income from another sector

16\.         Whether another family member generates income

17\.         Previous loan repayment pattern

18\.         Behavior and conduct with others

19\.         Mindset regarding repayment

20\.         Active political involvement

21\.         Discussion with guarantor

22\.         Discussion with family members

# **25\. Income and Expense Assessment**

For Dabi, Monthly Income, Monthly Expense and Liabilities are assessed by both the CDO and BM. The system preserves both assessments so the AI engine can compare them and flag significant differences.

*Assessment Difference Alert: CDO and BM reported substantially different household income values. This can become an important review indicator.*

# **26\. Dabi Geo-Verification**

Before submitting the loan application, the CDO must provide an image of the customer's house/business.

### **Required Process**

**›** Open Camera

**›** GPS Must Be Enabled

**›** Capture House/Business Image

**›** Extract Latitude & Longitude

**›** Display Coordinates

**›** Continue

The application displays: Latitude: XX.XXXXXX  |  Longitude: XX.XXXXXX

# **27\. Dabi GPS Validation**

| Condition | Result |
| :---- | :---- |
| Image contains valid location information | CDO can proceed |
| Image does not contain latitude/longitude | System prevents CDO from proceeding with submission |

*This is a mandatory MVP validation rule.*

# **28\. 500-Meter Area Intelligence**

After valid geo-verification, the system identifies other relevant borrowers within approximately 500 meters of the captured location, and retrieves available relevant information for those customers.

# **29\. Area Report**

The Area Report considers information from customers within the defined 500-meter area. Potential indicators include:

•      Number of borrowers

•      Number of active loans

•      Historical loan performance

•      Repayment behavior

•      Overdue patterns

•      Savings behavior

•      Customer risk distribution

•      Income/expense characteristics where available

•      Current loan exposure

•      Social acceptance indicators

•      Previous irregularity/fraud information where available

The AI engine converts these indicators into an understandable area-level assessment.

# **30\. Individual Customer Report**

The individual report analyzes the applicant's own information across four dimensions:

### **Financial**

•      Monthly income, monthly expense, liabilities

•      Proposed installment, tolerance, current cash position

### **Loan**

•      Previous loan history, repayment behavior, overdue history

•      Current loan status, proposed loan amount, loan duration

### **Savings**

•      Savings balance, savings consistency, withdrawal behavior

### **Social**

•      Social acceptance, family awareness, guarantor information, customer behavior

### **Checklist**

•      CDO information, BM information, AM information

# **31\. AI Report**

The AI report is the core intelligence feature of the MVP. It should not simply return a numerical score — it should provide:

•      Risk Level: Low / Moderate / High / Very High

•      Positive Indicators — what supports the loan application

•      Risk Indicators — what may create concern

•      Key Findings — the most important observations from the available data

•      Suggested Action — e.g. Proceed, Proceed with caution, Additional verification recommended, Review loan amount, Enhanced monitoring recommended, Further assessment required

*The system must not automatically make the final loan decision.*

# **32\. AI Report Example**

| Section | Content |
| :---- | :---- |
| Customer Risk | Risk Level: MODERATE |
| Positive Indicators | Previous loan successfully completed · Consistent savings activity · Stable primary income |
| Risk Indicators | Recent installment delays · Proposed installment is relatively high compared with available monthly surplus |
| Area Risk | Risk Level: HIGH |
| Area Findings | High overdue concentration · Multiple borrowers with repayment delays · Increasing outstanding exposure |
| Key Finding | The customer demonstrates relatively stable individual repayment behavior; however, the surrounding area shows elevated repayment risk. |
| Suggested Action | Additional review recommended. Consider the proposed loan amount and area-level repayment conditions. |

# **33\. Dabi CDO Submission Workflow**

**›** Login

**›** Profile

**›** Loan Application

**›** Income / Expense / Liabilities

**›** CDO Information

**›** House/Business Image

**›** GPS Validation

**›** 500m Area Analysis

**›** Individual Customer Analysis

**›** AI Report

**›** CDO Review

**›** Submit to BM

# **34\. Dabi BM Workflow**

BM receives the application and can see:

•      Customer profile

•      Loan application

•      Loan behavior

•      Savings behavior

•      CDO assessment

•      House/business image

•      Latitude/longitude

•      500m surrounding borrowers

•      Area report

•      Individual report

•      AI recommendation

# **35\. Dabi BM Location Rule**

| Condition | BM Location Input |
| :---- | :---- |
| CDO submitted a valid house/business image with location data | Optional |
| CDO submitted an image without valid latitude/longitude | Mandatory |

The BM must provide/verify valid location information before proceeding. This creates a second-level geo-verification control.

# **36\. Dabi BM Decision**

After reviewing the application and AI report, BM can approve/recommend to AM, request additional verification, return for correction, or take the appropriate action per the organizational workflow. The BM must be able to add a BM Checklist and BM Remarks before recommendation.

# **37\. Dabi AM Workflow**

AM receives the application from BM and can see the full customer profile, loan application, loan behavior, savings behavior, CDO assessment, BM assessment, geo information, 500m surrounding borrowers, area report, individual report, AI report, and BM Checklist. AM completes the AM Checklist and then recommends to RM, requests additional review, or returns the application where appropriate.

# **38\. Dabi RM Workflow**

RM receives the application after AM recommendation and can view all relevant information — customer profile, loan application, loan/savings behavior, GPS/image, area and individual reports, AI report, all prior assessments, checklist information, and previous recommendations. RM can Approve or Reject according to the MVP workflow.

# **39\. Progoti Profile**

The Progoti customer profile follows the same core profile structure and is maintained by the CO. It contains basic customer information, organizational information, loan behavior, savings behavior, geo information, and previous application information.

# **40\. Progoti Loan Application**

The CO can initiate a loan application from the customer profile; profile information automatically populates relevant fields.

# **41\. Progoti Loan Information**

•      Proposed Amount

•      Loan Purpose

•      Loan User

•      Loan Type

•      Loan Duration (Months)

•      Investment Sector

•      Scheme

•      Loan Product

# **42\. Progoti Income Information**

•      Income from Remittance

•      Income from Job

•      Monthly Income

•      CO Borrower Monthly Income

•      Other Business Income

•      Income from Family Member

•      Income from Business

•      Income from Main Project

•      Alternative Income

•      Other Income

•      Total Income

The system calculates Total Income where applicable.

# **43\. Progoti Expense Information**

•      House Rent

•      Utility Bill

•      Health & Education Expenses

•      Other Daily Expenses

•      Business Purpose Expenses

•      Bank/Loan Installment or Savings

•      Total Monthly Expenses

The system calculates Total Monthly Expenses.

# **44\. Progoti Tolerance**

The application calculates the customer's affordability/tolerance based on Total Income, Total Expenses, and Proposed Loan Installment.

*Available Surplus \= Total Income − Total Expenses*

The proposed installment is then compared with the available surplus. The exact organizational formula should be configurable.

# **45\. Progoti Checklist**

The CO completes the initial checklist:

23\.         Is the family member aware of the loan?

24\.         Is the loan borrower aware of the loan conditions?

25\.         Is the sector of use of loan money correct?

26\.         Is the project/business located in a profitable location?

27\.         Have both guarantors been informed of their obligations?

28\.         Is the loan sector profitable?

# **46\. Progoti Document Checklist**

| Document | Status |
| :---- | :---- |
| Loan Undertaking | Yes/No |
| Guarantor Agreement | Yes/No |
| Physical Verification Report | Yes/No |
| Bank Statement | Yes/No |
| Security Cheque | Yes/No |
| Title Deed | Yes/No |
| Previous Ownership Deed | Yes/No |
| Certified Copy \+ SRO Token | Yes/No |
| Possession Deed | Yes/No |
| DCR | Yes/No |
| Mutation Khatian | Yes/No |
| SA Khatian | Yes/No |
| R.S Khatian | Yes/No |
| B.S Khatian | Yes/No |
| Land Development Tax Receipt | Yes/No |
| Succession Certificate | Yes/No |
| Rental Deed | Yes/No |
| Others | Yes/No |

*The MVP should store checklist status and make missing required documents visible to reviewers.*

# **47\. Progoti CO Remarks**

The CO can provide remarks related to the customer's financial capacity and loan sustainability, e.g.:

*He is able to continue the loan based on income from house rent and business.*

# **48\. Progoti Loan Assessment Checklist**

### **Project Information**

•      Date of project visit

•      Type of business/project

•      Land/infrastructure ownership

•      Amount of goods in stock

### **Accommodation**

•      Type of accommodation

•      Family/relative discussion regarding loan (Name, Relationship, Occupation, Mobile Number)

### **Guarantor & Land**

•      Guarantor suitability

•      Family guarantor discussion

•      Guarantor discussion

•      Land accuracy verification

### **Loan Use & Repayment**

•      Investment sector suitability and profitability

•      Current project condition

•      Maximum installment repayment capacity

•      Previous repayment behavior

•      Customer behavior

•      Repayment intention

•      Active political involvement

### **AM/AAM Comment**

•      Recommendation / comment

# **49\. Progoti Geo-Verification**

Before submitting the application, the CO must capture the customer's house/business image. The image must contain valid location information.

### **Workflow**

**›** CO opens in-app camera

**›** GPS enabled

**›** Capture image

**›** Read location information

**›** Latitude \+ Longitude available

**›** Proceed

*If the image does not contain valid latitude/longitude, the CO cannot proceed. This is stricter than the BM workflow in Dabi because the CO is the primary geo-verification point for Progoti.*

# **50\. Progoti Area Intelligence**

After successful geo-verification, the system searches approximately 500 meters around the customer's location, identifies available borrowers in that area, and generates an Area Report and Individual Customer Report — presented to the CO before submission.

# **51\. Progoti CO Submission**

**›** Login

**›** Customer Profile

**›** Loan Application

**›** Income

**›** Expense

**›** Tolerance

**›** Checklist

**›** Document Checklist

**›** Loan Assessment

**›** House/Business Image

**›** GPS Validation

**›** 500m Area Analysis

**›** Individual Analysis

**›** AI Report

**›** CO Review

**›** Submit to AM

# **52\. Progoti AM Workflow**

AM receives the application from CO and can view the customer profile, loan application, loan/savings behavior, income, expenses, tolerance, checklist, documents, project assessment, GPS location, house/business image, 500m surrounding borrowers, area report, individual report, and AI assessment. AM can recommend to RM, request additional verification, or return the application where appropriate.

# **53\. Progoti RM Workflow**

RM receives the application after AM recommendation and can see the complete application and AI report. RM can Approve or Reject. The decision must be recorded with RM ID, Decision, Date/Time, and Remarks.

# **54\. Unified Risk Intelligence**

Both Dabi and Progoti use the same core AI intelligence concept. Customer-level Financial, Behavior and Social data combine into Customer Risk; Current Location and Nearby Borrowers combine into Area Data and then Area Risk. Customer Report and Area Report combine into an AI Insight, which produces a Suggested Action for human review.

# **55\. AI Input Categories**

### **A. Customer Profile**

•      Age, occupation, marital status, family information, primary earner, residence, other relevant profile information

### **B. Financial Capacity**

•      Income, expenses, liabilities, available surplus, proposed installment, tolerance

### **C. Loan Behavior**

•      Previous loans, repayment pattern, overdue, loan status, loan amount, loan cycle, collection behavior

### **D. Savings Behavior**

•      Savings balance, savings frequency, withdrawal behavior, payment method, savings trend

### **E. Social & Field Assessment**

•      Social acceptance, family awareness, guarantor information, customer behavior, repayment intention, CDO/BM/AM checklist

### **F. Area Intelligence**

•      Nearby borrowers, loan performance, repayment performance, overdue concentration, customer risk concentration, savings behavior, historical risk indicators

# **56\. AI Report Components**

29\.         Customer Risk Level — Low / Moderate / High / Very High

30\.         Area Risk Level — Low / Moderate / High / Very High

31\.         Positive Factors — factors supporting the application

32\.         Risk Factors — factors requiring attention

33\.         Data-Based Findings — important observations derived from the submitted data

34\.         Suggested Action — a recommendation for human review

# **57\. Risk Scoring**

The MVP may use a hybrid approach:

### **Phase 1**

Weighted rules and statistical analysis.

### **Phase 2**

Machine-learning model trained using historical organizational data.

*The MVP should be designed so that the risk engine can later be replaced or enhanced without redesigning the complete application.*

# **58\. Explainable AI Requirement**

The system must avoid providing an unexplained score. For example, "Customer Risk: 68 — High" should be accompanied by supporting reasons such as recent repayment deterioration, high proposed installment relative to available surplus, and previous overdue history. Similarly, "Area Risk: 74 — High" could be accompanied by high overdue concentration, multiple nearby customers with repayment issues, and high outstanding exposure.

*The exact reasons must be generated from the actual available data.*

# **59\. Suggested Action**

The AI generates a suggested action, not a binding decision:

| Risk Level | Suggested Action |
| :---- | :---- |
| Low Risk | Proceed with normal review. |
| Moderate Risk | Proceed with additional attention to identified risk factors. |
| High Risk | Additional verification/review recommended. |
| Very High Risk | Enhanced review recommended before proceeding. |

*The final decision always remains with the authorized officer.*

# **60\. Risk Report During Workflow**

The same report remains accessible at every relevant approval stage — Dabi: CDO → BM → AM → RM, and Progoti: CO → AM → RM. The report should not disappear after the field officer submits the application.

# **61\. Risk Snapshot**

When the loan application is submitted, the system preserves the risk assessment generated at that time, for example:

| Field | Value |
| :---- | :---- |
| Application | DABI-2026-00125 |
| Customer Risk | 42 |
| Area Risk | 68 |
| Generated | 30-Aug-2026 10:42 AM |

*If new data changes the customer's risk later, the historical application should still retain the original assessment used during that application.*

# **62\. Area Borrower Display**

After GPS verification, the user should see nearby relevant borrowers, for example a 500m area with 12 borrowers found, broken down by risk distribution (Low, Moderate, High, Very High). Selecting an individual borrower can show limited authorized information such as customer reference, loan status, risk level, repayment summary, and savings summary.

*Sensitive personal information should not be unnecessarily exposed to nearby-borrower users.*

# **63\. Map View**

The MVP should provide a basic map showing the applicant location, the 500m boundary, relevant nearby borrowers, and risk indicators for each.

# **64\. Offline Requirements**

The field application should support offline operation for the geo-verification component.

### **Offline**

The CDO/CO can open the customer profile, capture location through device GPS, capture the house/business photograph, and store the verification record locally.

### **Online**

The application can upload records, synchronize location, submit the loan application, retrieve the AI report, and retrieve nearby borrower information.

*The AI area analysis requires access to the central dataset, so the MVP should not promise full AI report generation while completely offline.*

# **65\. GPS/Image Data Requirements**

The location verification record should contain:

•      Customer ID

•      Image

•      Latitude

•      Longitude

•      Timestamp

•      Officer ID

•      Device information where appropriate

•      GPS accuracy where available

•      Verification status

The system should validate that the image's location information exists before allowing the required workflow to proceed.

# **66\. Important GPS Validation Rule**

| Workflow | Role | Condition | Result |
| :---- | :---- | :---- | :---- |
| Dabi | CDO | Image location available | CDO proceeds |
| Dabi | CDO | Image location unavailable | CDO cannot proceed |
| Dabi | BM | CDO image has valid coordinates | BM location \= Optional |
| Dabi | BM | CDO image does not have valid coordinates | BM location \= Mandatory |
| Progoti | CO | Image location available | CO proceeds |
| Progoti | CO | Image location unavailable | CO cannot proceed |

# **67\. Application Status**

### **Dabi**

**›** Draft

**›** Submitted by CDO

**›** BM Review

**›** BM Recommended

**›** AM Review

**›** AM Recommended

**›** RM Review

**›** Approved / Rejected

### **Progoti**

**›** Draft

**›** Submitted by CO

**›** AM Review

**›** AM Recommended

**›** RM Review

**›** Approved / Rejected

Additional status: Additional Verification Required.

# **68\. Role-Based Permissions**

| Feature | CDO | CO | BM | AM | RM |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Profile | Create/Edit | Create/Edit | View | View | View |
| Loan Application | Create | Create | View | View | View |
| GPS Verification | Yes | Yes | Verify if required | View | View |
| Loan Behavior | View | View | View | View | View |
| Savings Behavior | View | View | View | View | View |
| Area Report | View | View | View | View | View |
| Individual Report | View | View | View | View | View |
| CDO Checklist | Create | — | View | View | View |
| BM Checklist | — | — | Create | View | View |
| AM Checklist | — | — | — | Create | View |
| AI Report | View | View | View | View | View |
| Submit Application | Yes | Yes | Recommend | Recommend | — |
| Final Decision | — | — | — | — | Approve/Reject |

# **69\. Core Database Entities**

| Entity | Description |
| :---- | :---- |
| Customer | Stores customer profile |
| Customer Location | Stores current and historical geo-verification |
| Loan | Stores loan-level information |
| Loan Transactions | Stores repayment/collection history |
| Savings Transactions | Stores savings history |
| Loan Application | Stores proposed loan information |
| Income Assessment | Stores income information and assessment source |
| Expense Assessment | Stores expense information and assessment source |
| Liability Assessment | Stores liability information |
| Checklist | Stores CDO/BM/AM/CO assessment information |
| Documents | Stores document checklist information |
| Geo Area | Stores calculated area-level data |
| Risk Assessment | Stores customer and area risk |
| AI Report | Stores generated AI findings and suggested action |
| Workflow Action | Stores submission, recommendation, approval and rejection history |

# **70\. Audit Trail**

Every major action should be logged, for example: profile created/updated, GPS captured, photo captured, loan application created, risk report generated, application submitted, BM/AM reviewed, RM approved/rejected.

Each logged action should record:

•      User

•      Role

•      Date/time

•      Action

•      Application/customer reference

•      Relevant remarks

# **71\. Security Requirements**

Because the system processes customer and financial information, the MVP must implement basic security controls:

•      Authentication

•      Role-based access

•      Secure API

•      HTTPS

•      Access control

•      Audit logs

•      Secure local storage

•      Session management

### **Location Security**

GPS data should only be accessible to authorized users.

# **72\. Privacy Requirements**

The system should follow the principle of minimum necessary information. When showing nearby borrowers within 500 meters, the application should not expose unnecessary personal information — for example, an officer may see Customer ID, Loan Status, and Risk level rather than every personal detail of the nearby customer.

# **73\. AI Safety and Human Decision Requirement**

GeoCredit AI is a decision-support product. The AI should never independently approve or reject a customer in the MVP. The system should clearly communicate:

*AI Recommendation — Human Review Required*

The authorized officer remains responsible for the final decision.

# **74\. Functional Requirement Summary**

| ID | Requirement | Priority |
| :---- | :---- | :---- |
| FR-01 | Authentication | Must Have |
| FR-02 | Role-based access | Must Have |
| FR-03 | Customer profile | Must Have |
| FR-04 | Loan behavior | Must Have |
| FR-05 | Savings behavior | Must Have |
| FR-06 | Loan application | Must Have |
| FR-07 | Income/expense assessment | Must Have |
| FR-08 | Checklist | Must Have |
| FR-09 | House/business image | Must Have |
| FR-10 | GPS validation | Must Have |
| FR-11 | 500m area search | Must Have |
| FR-12 | Individual risk report | Must Have |
| FR-13 | Area risk report | Must Have |
| FR-14 | AI analysis | Must Have |
| FR-15 | Suggested action | Must Have |
| FR-16 | Dabi workflow | Must Have |
| FR-17 | Progoti workflow | Must Have |
| FR-18 | Risk snapshot | Must Have |
| FR-19 | Audit trail | Should Have |
| FR-20 | Map visualization | Should Have |
| FR-21 | Advanced predictive ML | Future |
| FR-22 | Advanced fraud detection | Future |

# **75\. MVP Acceptance Criteria — Dabi**

The MVP is considered successful when the following end-to-end scenario works:

35\.         CDO logs in using their PIN.

36\.         CDO opens/adds a customer profile.

37\.         Basic profile information can be stored.

38\.         Loan behavior can be viewed.

39\.         Savings behavior can be viewed.

40\.         CDO initiates a loan application.

41\.         Existing profile information is automatically populated.

42\.         CDO enters proposed loan and financial information.

43\.         CDO completes required information.

44\.         CDO captures the customer's house/business image.

45\.         Image contains valid latitude/longitude.

46\.         Coordinates are displayed.

47\.         System identifies available borrowers within 500 meters.

48\.         System generates area-level intelligence.

49\.         System generates individual customer intelligence.

50\.         AI generates a combined report.

51\.         AI provides risk factors and suggested action.

52\.         CDO submits the application.

53\.         BM receives the application.

54\.         BM can see all relevant reports.

55\.         BM completes the BM Checklist.

56\.         BM can recommend the application to AM.

57\.         AM receives the application.

58\.         AM can see all reports and previous assessments.

59\.         AM completes the AM Checklist.

60\.         AM recommends to RM.

61\.         RM sees the complete application.

62\.         RM can approve or reject.

63\.         The final decision is recorded.

# **76\. MVP Acceptance Criteria — Progoti**

64\.         CO logs in.

65\.         CO opens/adds a customer profile.

66\.         Profile information can be stored.

67\.         Loan behavior can be viewed.

68\.         Savings behavior can be viewed.

69\.         CO starts a loan application.

70\.         Profile information is automatically populated.

71\.         CO enters loan and financial information.

72\.         CO completes checklist and document checklist.

73\.         CO completes loan assessment information.

74\.         CO captures the house/business image.

75\.         Image must contain valid location information.

76\.         System validates latitude/longitude.

77\.         System identifies borrowers within approximately 500 meters.

78\.         Area report is generated.

79\.         Individual customer report is generated.

80\.         AI generates the risk assessment.

81\.         CO reviews the report.

82\.         CO submits the application to AM.

83\.         AM reviews the complete application.

84\.         AM recommends to RM.

85\.         RM reviews the complete application.

86\.         RM approves or rejects.

87\.         Decision is recorded.

# **77\. MVP Demo Story**

The strongest MVP demonstration should use one customer and follow the entire process.

### **Step 1 — CDO Login**

CDO enters PIN: 1547800

### **Step 2 — Customer Profile**

The customer profile is opened.

### **Step 3 — Historical Behavior**

The CDO opens Loan Behavior and sees the customer's previous loan and installment history, then Savings Behavior and sees savings transactions and balance history.

### **Step 4 — Loan Application**

The CDO starts a new application. Profile information automatically appears. The CDO enters proposed amount, loan purpose/use, income, expense, liabilities, and other required information.

### **Step 5 — Geo-Verification**

The CDO visits the customer's house/business and captures the image using the in-app camera. The system validates: GPS Available ✓

### **Step 6 — Area Intelligence**

The system searches the surrounding 500-meter area and finds nearby borrowers.

### **Step 7 — AI Report**

The system analyzes customer, loan history, savings history, income, expense, liabilities, checklist, nearby borrowers, and area history to generate the AI Risk Report.

### **Step 8 — CDO Submission**

The CDO reviews the report and submits.

### **Step 9 — BM Review**

BM receives the application and sees the same intelligence, completes the BM Checklist, and recommends to AM.

### **Step 10 — AM Review**

AM sees the complete history, AI report and checklist, and recommends to RM.

### **Step 11 — RM Decision**

RM sees the complete application and chooses Approve / Reject.

*This demonstrates the complete value proposition of GeoCredit AI.*

# **78\. MVP Non-Goals**

### **No Fully Automated Credit Decision**

AI should not make the final decision.

### **No Complex National Risk Map**

The MVP focuses on the applicant's 500-meter surrounding area.

### **No Advanced Fraud Network**

Historical fraud/irregularity information can be included as risk indicators, but a complex fraud network is outside MVP scope.

### **No Complete Enterprise Integration**

The MVP can use a controlled/demo dataset or limited API integration.

### **No Advanced ML Requirement**

The MVP can begin with a transparent scoring/rules engine and AI-generated explanation.

# **79\. Future Enhancements**

### **Advanced Predictive Risk**

Predict probability of future repayment problems.

### **Dynamic Geo Risk**

Continuously update geographical risk as new transactions arrive.

### **Risk Heatmap**

Display risk across branches, areas and regions.

### **Fraud Network Detection**

Identify relationships between customers, locations, loans and irregularities.

### **Seasonal Risk**

Identify seasonal repayment patterns.

### **Automated Early Warning**

Monitor existing customers continuously.

### **Portfolio Intelligence**

Provide management with branch/area/region-level portfolio risk.

### **External Data**

Potentially incorporate economic indicators, weather, market information, and other approved external datasets.

# **80\. Product Success Metrics**

### **Adoption**

•      Number of CDO/CO users

•      Number of loan applications processed

•      Percentage of applications using GeoCredit AI

### **Geo-Verification**

•      Percentage of applications with valid GPS

•      GPS validation success rate

•      Number of successful offline captures

### **Risk Intelligence**

•      Percentage of applications receiving an AI report

•      Percentage of reports with explainable factors

•      Identification rate of known high-risk cases

### **Operational**

•      Time taken to understand an unfamiliar area

•      Time taken to review a loan application

•      Supervisor usage of AI reports

# **81\. MVP Definition of Done**

## **Android Application**

•      CDO, CO, and BM login

•      Customer profile

•      Loan behavior

•      Savings behavior

•      Dabi and Progoti loan applications

•      Income, expense, and liability/tolerance calculation

•      Dabi checklist, Progoti checklist, document checklist, loan assessment checklist

•      In-app camera and GPS validation

•      Location display

•      500m borrower search

•      Individual report, area report, AI report, suggested action

•      Application submission

•      BM review and recommendation

## **Web Portal**

•      AM and RM login

•      Dabi and Progoti application review

•      Customer information

•      Loan and savings behavior

•      Geo information

•      Area report, individual report, AI report

•      BM assessment

•      AM checklist and recommendation

•      RM approval/rejection

•      Decision history

## **Backend**

•      Authentication and role management

•      Customer, loan, loan transaction, savings, and location databases

•      Application workflow engine

•      500m geospatial query

•      Risk calculation and AI report generation

•      Risk snapshot

•      Audit logging

# **82\. Final MVP Product Definition**

GeoCredit AI combines Customer Data (loan, savings, financial) with Location Data (GPS \+ image) to build 500m Area Data. Both customer and area data feed the AI Engine, which produces Individual Risk and Area Risk, combined into an AI Risk Report with a Suggested Action. This flows into the Dabi (CDO → BM → AM → RM) or Progoti (CO → AM → RM) workflow, ending in a Human Decision: Approve or Reject.

*The core MVP proposition: Before a loan is approved, GeoCredit AI tells the organization both what it knows about the borrower and what it knows about the borrower's surrounding area — and uses AI to turn that information into an explainable risk assessment and suggested action.*

# **83\. One-Line MVP Value Proposition**

*GeoCredit AI helps CDOs, COs and supervisors make better rural lending decisions by combining verified customer location, 500-meter area intelligence, loan and savings behavior, financial capacity and field assessments into one explainable AI-powered risk report.*

