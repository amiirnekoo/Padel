#!/usr/bin/env bash
# ==============================================================================
# 🎾 Rally Padel - Automated Database Backup & Disaster Recovery Script
# Performs compressed pg_dump and enforces 14-day retention rotation.
# Recommended cron: 0 3 * * * /root/Padel/scripts/backup_db.sh > /dev/null 2>&1
# ==============================================================================
set -euo pipefail

BACKUP_DIR="/root/backups/padel"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/padel_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⏳ Starting PostgreSQL backup for padel_production..."

if docker ps --format '{{.Names}}' | grep -q "^rally_postgres$"; then
    docker exec rally_postgres pg_dump -U padel_user -d padel_production --no-owner --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Error: rally_postgres container is not running!" >&2
    exit 1
fi

# Cleanup backups older than retention window
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "padel_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Backup and rotation completed."
