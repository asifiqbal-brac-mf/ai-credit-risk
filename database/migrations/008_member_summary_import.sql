-- Additive summary storage. No transaction dates or schedules are inferred.
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS source_system text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES organizations(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS source_system text;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_kind_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_kind_check CHECK (kind IN ('BRANCH','AREA','REGION','VO'));
CREATE UNIQUE INDEX IF NOT EXISTS organizations_vo_code_idx ON organizations(parent_id,code) WHERE kind='VO';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS member_status text CHECK (member_status IN ('ACTIVE','CLOSED'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vo_id uuid REFERENCES organizations(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_cdo_id uuid REFERENCES users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source_system text;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS installment_amount numeric(14,2) CHECK (installment_amount>=0);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS realized_amount numeric(14,2) CHECK (realized_amount>=0);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_due numeric(14,2) CHECK (loan_due>=0);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS schedule_miss_count integer CHECK (schedule_miss_count>=0);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS partial_payment_count integer CHECK (partial_payment_count>=0);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS source_system text;
CREATE TABLE IF NOT EXISTS savings_accounts (
 id uuid PRIMARY KEY,
 customer_id uuid NOT NULL REFERENCES customers(id),
 account_no text NOT NULL UNIQUE,
 status text NOT NULL CHECK(status IN ('ACTIVE','CLOSED')),
 product text NOT NULL,
 account_type text NOT NULL,
 installment_amount numeric(14,2) NOT NULL CHECK(installment_amount>=0),
 principal_amount numeric(14,2) NOT NULL CHECK(principal_amount>=0),
 balance numeric(14,2) NOT NULL CHECK(balance>=0),
 source_system text NOT NULL
);
