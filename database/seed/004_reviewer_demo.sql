-- Complete reviewer-console demo records. These are intentionally stable and safe to re-run.
UPDATE customers SET nid='1987654321098',date_of_birth='1990-04-12',image_url='https://placehold.co/240x240/png?text=Ayesha',vo_code='1234',erp_member_id='100001' WHERE id='20000000-0000-0000-0000-000000000001';
UPDATE customers SET nid='1990123456789',date_of_birth='1988-09-21',image_url='https://placehold.co/240x240/png?text=BM',vo_code='2345',erp_member_id='100002' WHERE id='20000000-0000-0000-0000-000000000101';
UPDATE customers SET nid='1976543210987',date_of_birth='1992-01-17',image_url='https://placehold.co/240x240/png?text=AM',vo_code='3456',erp_member_id='100003' WHERE id='20000000-0000-0000-0000-000000000102';
UPDATE customers SET nid='1965432109876',date_of_birth='1985-11-03',image_url='https://placehold.co/240x240/png?text=RM',vo_code='4567',erp_member_id='100004' WHERE id='20000000-0000-0000-0000-000000000103';
UPDATE customers SET nid='1998765432101',date_of_birth='1994-02-08',image_url='https://placehold.co/240x240/png?text=Member+02',vo_code='5678',erp_member_id='100005' WHERE id='20000000-0000-0000-0000-000000000002';
UPDATE customers SET nid='1987654321099',date_of_birth='1989-06-25',image_url='https://placehold.co/240x240/png?text=Member+03',vo_code='6789',erp_member_id='100006' WHERE id='20000000-0000-0000-0000-000000000003';
UPDATE customers SET nid='1978901234567',date_of_birth='1991-10-14',image_url='https://placehold.co/240x240/png?text=Member+04',vo_code='7890',erp_member_id='100007' WHERE id='20000000-0000-0000-0000-000000000004';
UPDATE customers SET nid='1967890123456',date_of_birth='1987-12-19',image_url='https://placehold.co/240x240/png?text=Member+05',vo_code='8901',erp_member_id='100008' WHERE id='20000000-0000-0000-0000-000000000005';
UPDATE customers SET nid='1956789012345',date_of_birth='1993-03-30',image_url='https://placehold.co/240x240/png?text=Member+06',vo_code='9012',erp_member_id='100009' WHERE id='20000000-0000-0000-0000-000000000006';
UPDATE area_queries SET metrics=metrics || '{"areaCreditScore":72,"scoreBand":"MODERATE"}'::jsonb WHERE application_id IN ('90000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000102','90000000-0000-0000-0000-000000000103');
INSERT INTO customers(id,customer_ref,display_name,branch_id,area_id,region_id) VALUES
('20000000-0000-0000-0000-000000000101','CUS-DEMO-BM','BM Demo Borrower','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111'),
('20000000-0000-0000-0000-000000000102','CUS-DEMO-AM','AM Demo Borrower','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111'),
('20000000-0000-0000-0000-000000000103','CUS-DEMO-RM','RM Demo Borrower','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111') ON CONFLICT DO NOTHING;

INSERT INTO applications(id,product,customer_id,status,version,owner_id,branch_id,area_id,region_id) VALUES
('90000000-0000-0000-0000-000000000101','DABI','20000000-0000-0000-0000-000000000101','SUBMITTED_BY_CDO',2,'10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111'),
('90000000-0000-0000-0000-000000000102','DABI','20000000-0000-0000-0000-000000000102','BM_RECOMMENDED',3,'10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111'),
('90000000-0000-0000-0000-000000000103','DABI','20000000-0000-0000-0000-000000000103','AM_RECOMMENDED',4,'10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000111') ON CONFLICT DO NOTHING;

INSERT INTO application_versions(id,application_id,version,payload,created_by) VALUES
('91000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000101',2,'{"financialAssessment":{"monthlyIncome":60000,"monthlyExpense":25000,"proposedAmount":20000,"proposedTermMonths":12}}','10000000-0000-0000-0000-000000000001'),
('91000000-0000-0000-0000-000000000102','90000000-0000-0000-0000-000000000102',3,'{"financialAssessment":{"monthlyIncome":75000,"monthlyExpense":30000,"proposedAmount":35000,"proposedTermMonths":18}}','10000000-0000-0000-0000-000000000001'),
('91000000-0000-0000-0000-000000000103','90000000-0000-0000-0000-000000000103',4,'{"financialAssessment":{"monthlyIncome":90000,"monthlyExpense":40000,"proposedAmount":50000,"proposedTermMonths":24}}','10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;

INSERT INTO financial_assessments(id,application_id,application_version,monthly_income,monthly_expense,external_debt,proposed_amount,proposed_term_months,proposed_installment,monthly_surplus,created_by) VALUES
('92000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000101',2,60000,25000,0,20000,12,1800,35000,'10000000-0000-0000-0000-000000000001'),
('92000000-0000-0000-0000-000000000102','90000000-0000-0000-0000-000000000102',3,75000,30000,5000,35000,18,2300,45000,'10000000-0000-0000-0000-000000000001'),
('92000000-0000-0000-0000-000000000103','90000000-0000-0000-0000-000000000103',4,90000,40000,0,50000,24,2700,50000,'10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;

INSERT INTO area_queries(id,application_id,application_version,center,radius_meters,cohort_count,outcome,metrics,created_by) VALUES
('93000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000101',2,ST_SetSRID(ST_MakePoint(90.2790,23.7800),4326)::geography,500,6,'READY','{"borrowerCount":6,"overdueCount":1,"riskDistribution":{"LOW":3,"MODERATE":2,"HIGH":1}}','10000000-0000-0000-0000-000000000001'),
('93000000-0000-0000-0000-000000000102','90000000-0000-0000-0000-000000000102',3,ST_SetSRID(ST_MakePoint(90.2790,23.7800),4326)::geography,500,6,'READY','{"borrowerCount":6,"overdueCount":1,"riskDistribution":{"LOW":3,"MODERATE":2,"HIGH":1}}','10000000-0000-0000-0000-000000000001'),
('93000000-0000-0000-0000-000000000103','90000000-0000-0000-0000-000000000103',4,ST_SetSRID(ST_MakePoint(90.2790,23.7800),4326)::geography,500,6,'READY','{"borrowerCount":6,"overdueCount":1,"riskDistribution":{"LOW":3,"MODERATE":2,"HIGH":1}}','10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;

UPDATE customers SET nid='1987654321098',date_of_birth='1990-04-12',image_url='https://placehold.co/240x240/png?text=Ayesha',vo_code='1234',erp_member_id='100001' WHERE id='20000000-0000-0000-0000-000000000001';
UPDATE customers SET nid='1990123456789',date_of_birth='1988-09-21',image_url='https://placehold.co/240x240/png?text=BM',vo_code='VO-DHK-002',erp_member_id='ERP-DEMO-BM' WHERE id='20000000-0000-0000-0000-000000000101';
UPDATE customers SET nid='1976543210987',date_of_birth='1992-01-17',image_url='https://placehold.co/240x240/png?text=AM',vo_code='VO-DHK-003',erp_member_id='ERP-DEMO-AM' WHERE id='20000000-0000-0000-0000-000000000102';
UPDATE customers SET nid='1965432109876',date_of_birth='1985-11-03',image_url='https://placehold.co/240x240/png?text=RM',vo_code='VO-DHK-004',erp_member_id='ERP-DEMO-RM' WHERE id='20000000-0000-0000-0000-000000000103';

-- CDO member-risk scenario: one active loan with a missed schedule and partial payment.
INSERT INTO loans(id,customer_id,loan_ref,product,status,principal,outstanding,overdue,started_on,closed_on) VALUES
('30000000-0000-0000-0000-000000000101','20000000-0000-0000-0000-000000000001','LN-DEMO-MISS-01','DABI','ACTIVE',80000,62000,4500,'2025-06-15',NULL) ON CONFLICT DO NOTHING;
INSERT INTO loan_transactions(id,loan_id,collection_date,target,collection,overdue,status) VALUES
('31000000-0000-0000-0000-000000000101','30000000-0000-0000-0000-000000000101','2026-06-15',4500,4500,0,'PAID'),
('31000000-0000-0000-0000-000000000102','30000000-0000-0000-0000-000000000101','2026-07-15',4500,2000,2500,'PARTIAL'),
('31000000-0000-0000-0000-000000000103','30000000-0000-0000-0000-000000000101','2026-08-15',4500,0,4500,'MISSED') ON CONFLICT DO NOTHING;
INSERT INTO borrower_area_metrics(customer_id,loan_status,risk_level,has_current_overdue,has_recent_delay,savings_trend) VALUES
('20000000-0000-0000-0000-000000000001','ACTIVE','HIGH',true,true,'DECLINING')
ON CONFLICT(customer_id) DO UPDATE SET loan_status=EXCLUDED.loan_status,risk_level=EXCLUDED.risk_level,has_current_overdue=EXCLUDED.has_current_overdue,has_recent_delay=EXCLUDED.has_recent_delay,savings_trend=EXCLUDED.savings_trend;
