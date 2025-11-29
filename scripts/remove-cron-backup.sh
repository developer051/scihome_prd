#!/bin/bash

# สคริปต์สำหรับลบ cron job สำหรับ backup database
# ใช้งาน: bash scripts/remove-cron-backup.sh

set -e

# สีสำหรับ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/auto-backup.sh"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ลบ Cron Job สำหรับ Backup Database${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ตรวจสอบว่า cron job มีอยู่หรือไม่
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    # ลบ cron job
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
    echo -e "${GREEN}✓ ลบ cron job สำเร็จ${NC}"
    echo ""
    echo "Cron job ที่เหลืออยู่:"
    crontab -l 2>/dev/null || echo "ไม่มี cron job อื่นๆ"
else
    echo -e "${YELLOW}⚠ ไม่พบ cron job สำหรับ backup${NC}"
fi

echo ""

