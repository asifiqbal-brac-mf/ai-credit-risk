CREATE TABLE IF NOT EXISTS scoring_rules (
  version text PRIMARY KEY, definition jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO scoring_rules(version,definition) VALUES ('demo-client-v1','{"demo":true,"direction":"HIGHER_IS_BETTER","weights":{"incomeSource":50,"socialAcceptance":10,"transactionHistory":20,"savings":10,"houseInfrastructure":10},"thresholds":{"RISK_FREE_LOAN":80,"REVIEW_REQUIRED":60},"normalization":"See doc/GeoCredit_AI_Demo_Client_Rules_v1.md","rounding":"integer fixed point, half up"}') ON CONFLICT DO NOTHING;
INSERT INTO scoring_rules(version,definition) VALUES ('demo-gps-v1','{"maximumAccuracyMeters":100,"maximumAgeSeconds":1800,"maximumFutureSkewSeconds":30}') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS client_assessments (
  id uuid PRIMARY KEY, application_id uuid NOT NULL REFERENCES applications(id),
  application_version integer NOT NULL, assessor_role text NOT NULL CHECK(assessor_role IN ('CDO','BM')),
  created_by uuid NOT NULL REFERENCES users(id), rule_version text NOT NULL REFERENCES scoring_rules(version),
  raw_input jsonb NOT NULL, portfolio_facts jsonb NOT NULL, result jsonb NOT NULL,
  complete boolean NOT NULL, total_score numeric(5,2),
  idempotency_key text NOT NULL, request_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(created_by,idempotency_key),
  CHECK((complete AND total_score IS NOT NULL AND total_score BETWEEN 0 AND 100) OR (NOT complete AND total_score IS NULL))
);
CREATE INDEX IF NOT EXISTS client_assessments_latest_idx ON client_assessments(application_id,assessor_role,application_version DESC);
CREATE TABLE IF NOT EXISTS submission_snapshots (
  id uuid PRIMARY KEY, application_id uuid NOT NULL REFERENCES applications(id), application_version integer NOT NULL,
  actor_id uuid NOT NULL REFERENCES users(id), action text NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(application_id,application_version)
);
CREATE OR REPLACE FUNCTION prevent_snapshot_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable snapshot: append a new version instead'; END; $$;
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='client_assessments_immutable') THEN
    CREATE TRIGGER client_assessments_immutable BEFORE UPDATE OR DELETE ON client_assessments FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_mutation();
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='submission_snapshots_immutable') THEN
    CREATE TRIGGER submission_snapshots_immutable BEFORE UPDATE OR DELETE ON submission_snapshots FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_mutation();
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='scoring_rules_immutable') THEN
    CREATE TRIGGER scoring_rules_immutable BEFORE UPDATE OR DELETE ON scoring_rules FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_mutation();
  END IF;
END $$;
