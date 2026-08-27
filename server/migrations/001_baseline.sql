-- Baseline migration for RunnerOS V1.5.
-- Fresh installs can use schema.sql. This migration is kept for future migration tooling.
BEGIN;
CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
INSERT INTO schema_migrations(version) VALUES ('001_baseline') ON CONFLICT DO NOTHING;
COMMIT;
