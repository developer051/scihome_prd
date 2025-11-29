#!/bin/bash

# สคริปต์สำหรับตั้งค่า cron job สำหรับ backup database ทุกวันเวลา 01:00
# ใช้งาน: bash scripts/setup-cron-backup.sh

set -e

# สีสำหรับ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/auto-backup.sh"
CRON_LOG="$PROJECT_ROOT/logs/cron-backup.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ตั้งค่า Cron Job สำหรับ Backup Database${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# สร้างโฟลเดอร์ logs ถ้ายังไม่มี
mkdir -p "$PROJECT_ROOT/logs"

# ตรวจสอบว่า backup script มีอยู่หรือไม่
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}✗ ไม่พบไฟล์ backup script: $BACKUP_SCRIPT${NC}"
    exit 1
fi

# ทำให้ backup script สามารถรันได้
chmod +x "$BACKUP_SCRIPT"

# สร้าง cron job entry
CRON_ENTRY="0 1 * * * cd $PROJECT_ROOT && bash $BACKUP_SCRIPT >> $CRON_LOG 2>&1"

# ตรวจสอบว่า cron job มีอยู่แล้วหรือไม่
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo -e "${YELLOW}⚠ Cron job สำหรับ backup มีอยู่แล้ว${NC}"
    echo ""
    echo "Cron job ปัจจุบัน:"
    crontab -l 2>/dev/null | grep "$BACKUP_SCRIPT"
    echo ""
    read -p "ต้องการแทนที่ cron job เดิมหรือไม่? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}ยกเลิกการตั้งค่า${NC}"
        exit 0
    fi
    # ลบ cron job เดิม
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
fi

# เพิ่ม cron job ใหม่
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo -e "${GREEN}✓ เพิ่ม cron job สำเร็จ${NC}"
echo ""
echo "Cron job ที่ตั้งค่า:"
echo -e "${BLUE}$CRON_ENTRY${NC}"
echo ""
echo "Cron job ทั้งหมด:"
crontab -l
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ ตั้งค่าเสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "หมายเหตุ:"
echo "- Backup จะทำงานอัตโนมัติทุกวันเวลา 01:00 น."
echo "- Log จะถูกบันทึกที่: $CRON_LOG"
echo "- ตรวจสอบ log ด้วยคำสั่ง: tail -f $CRON_LOG"
echo ""

