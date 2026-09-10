-- Additive foundation. Existing creator ownership and histories remain unchanged.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES users(id);
ALTER TABLE workflow_actions ADD COLUMN IF NOT EXISTS request_hash text;
UPDATE applications a SET reviewer_id=w.actor_id FROM workflow_actions w
WHERE a.reviewer_id IS NULL AND a.status IN ('BM_REVIEW','AM_REVIEW','RM_REVIEW')
  AND w.application_id=a.id AND w.action='START_REVIEW' AND w.to_status=a.status
  AND w.application_version=a.version;
