ALTER TABLE customers ADD COLUMN IF NOT EXISTS nid text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vo_code text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS erp_member_id text;
CREATE UNIQUE INDEX IF NOT EXISTS customers_erp_member_id_idx ON customers(erp_member_id) WHERE erp_member_id IS NOT NULL;
