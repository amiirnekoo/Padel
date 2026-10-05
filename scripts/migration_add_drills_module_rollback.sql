-- ==============================================================================
-- 🎾 Rollback: Specialized Drills Module (تمرینات تخصصی رالی)
-- Author: Rally Engineering Team
-- Mode: Transactional Disaster Recovery
-- WARNING: This will drop all drill module tables and associated data!
-- ==============================================================================

BEGIN;

DROP TABLE IF EXISTS drill_completion_events CASCADE;
DROP TABLE IF EXISTS user_drill_activities CASCADE;
DROP TABLE IF EXISTS drill_media CASCADE;
DROP TABLE IF EXISTS drills CASCADE;

COMMIT;
