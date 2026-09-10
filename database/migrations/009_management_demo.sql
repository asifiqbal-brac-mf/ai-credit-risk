-- Additive, idempotent demo identity for the standalone Management Risk Map.
-- This is intentionally an ADMIN-scoped demo account because the current
-- schema has no dedicated MANAGEMENT role.
INSERT INTO users (id, username, role, department, active)
VALUES (gen_random_uuid(), 'management.demo', 'ADMIN', 'SHARED', true)
ON CONFLICT (username) DO UPDATE SET active = true;
