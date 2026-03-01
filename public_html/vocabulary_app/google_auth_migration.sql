-- Add Google Auth columns to users if they don't exist
-- Matches the logic in game/google_auth_migration.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
