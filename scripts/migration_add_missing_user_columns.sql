-- Migration: Add missing user columns to PostgreSQL production database
-- Safe and idempotent: Uses IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_sport VARCHAR(20) DEFAULT 'PADEL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS dominant_hand VARCHAR(20) DEFAULT 'RIGHT';
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
