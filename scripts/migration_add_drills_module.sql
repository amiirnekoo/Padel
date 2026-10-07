-- ==============================================================================
-- 🎾 Migration: Add Specialized Drills Module (تمرینات تخصصی رالی)
-- Author: Rally Engineering Team
-- Mode: Incremental & Idempotent with Transactional Safety
-- Pre-requisites: users table must exist
-- Rollback strategy documented at the end of this script
-- ==============================================================================

BEGIN;

-- 1. Table: drills
CREATE TABLE IF NOT EXISTS drills (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(140) NOT NULL UNIQUE,
    sport VARCHAR(20) NOT NULL,
    category VARCHAR(30) NOT NULL,
    level VARCHAR(20) NOT NULL,
    participant_type VARCHAR(20) NOT NULL DEFAULT 'SOLO',
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    objective TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    equipment_required JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    safety_precautions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    content_version INTEGER NOT NULL DEFAULT 1,
    approved_version INTEGER NULL,
    author_id VARCHAR(36) NULL,
    author_name VARCHAR(100) NOT NULL DEFAULT 'مربی رالی',
    reviewer_id VARCHAR(36) NULL,
    reviewer_name VARCHAR(100) NULL,
    review_notes TEXT NULL,
    reviewed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    last_editor_id VARCHAR(36) NULL,
    last_editor_name VARCHAR(100) NULL,
    version_contributors JSONB NOT NULL DEFAULT '[]'::jsonb,
    cover_media_id VARCHAR(36) NULL,
    published_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for drills
CREATE INDEX IF NOT EXISTS idx_drills_status ON drills (status);
CREATE INDEX IF NOT EXISTS idx_drills_sport_category ON drills (sport, category);
CREATE INDEX IF NOT EXISTS idx_drills_level ON drills (level);
CREATE INDEX IF NOT EXISTS idx_drills_published_at ON drills (published_at DESC);


-- 2. Table: drill_media
CREATE TABLE IF NOT EXISTS drill_media (
    id VARCHAR(36) PRIMARY KEY,
    drill_id VARCHAR(36) NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
    storage_key VARCHAR(255) NOT NULL UNIQUE,
    original_filename VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    validation_error TEXT NULL,
    duration_seconds INTEGER NULL,
    width INTEGER NULL,
    height INTEGER NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    provenance VARCHAR(30) NOT NULL DEFAULT 'UNSPECIFIED',
    usage_rights_status VARCHAR(30) NOT NULL DEFAULT 'UNAUTHORIZED',
    license_details TEXT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'fa',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for drill_media
CREATE INDEX IF NOT EXISTS idx_drill_media_drill_id ON drill_media (drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_media_validation ON drill_media (validation_status);


-- 3. Table: user_drill_activities
CREATE TABLE IF NOT EXISTS user_drill_activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drill_id VARCHAR(36) NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
    is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarked_at TIMESTAMP WITHOUT TIME ZONE NULL,
    completion_count INTEGER NOT NULL DEFAULT 0,
    last_completed_at TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_drill_activity UNIQUE (user_id, drill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_drill_activities_user ON user_drill_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_user_drill_activities_drill ON user_drill_activities (drill_id);


-- 4. Table: drill_completion_events
CREATE TABLE IF NOT EXISTS drill_completion_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drill_id VARCHAR(36) NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(100) NOT NULL,
    client_timestamp TIMESTAMP WITHOUT TIME ZONE NULL,
    server_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_drill_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_drill_completion_events_user_key ON drill_completion_events (user_id, idempotency_key);

COMMIT;
