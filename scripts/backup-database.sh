#!/bin/bash

# สคริปต์สำหรับ backup MongoDB database และบันทึกไฟล์ในโฟลเดอร์ backups
# ใช้งาน: bash scripts/backup-database.sh

set -e

# สีสำหรับ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ข้อมูลการเชื่อมต่อ MongoDB จาก docker-compose.yml
MONGO_USER="root"
MONGO_PASSWORD="2!p\$OcY^%OsoVB\$*0F3x"
MONGO_DB="scihome"
MONGO_AUTH_DB="admin"
CONTAINER_NAME="scihome-mongodb"

# สร้าง timestamp สำหรับชื่อโฟลเดอร์ backup
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/backup-${TIMESTAMP}"
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

# เปลี่ยนไปที่โฟลเดอร์โปรเจกต์
cd "$PROJECT_ROOT"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}เริ่มทำการ Backup Database${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# สร้างโฟลเดอร์ backup
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ สร้างโฟลเดอร์ backup: ${BACKUP_DIR}${NC}"

# ตรวจสอบว่า container ทำงานอยู่หรือไม่
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}⚠ MongoDB container ไม่ได้ทำงานอยู่${NC}"
    echo -e "${YELLOW}กำลังพยายามเริ่ม container...${NC}"
    docker-compose up -d mongodb
    sleep 5
fi

# ทำการ backup MongoDB โดยใช้ mongodump
echo ""
echo -e "${YELLOW}กำลังทำการ backup MongoDB database...${NC}"

MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb"
mkdir -p "$MONGO_BACKUP_DIR"

# ใช้ mongodump ผ่าน docker exec
if docker exec "$CONTAINER_NAME" mongodump \
    --username "$MONGO_USER" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase "$MONGO_AUTH_DB" \
    --db "$MONGO_DB" \
    --out /tmp/mongodb_backup 2>/dev/null; then
    
    # คัดลอกไฟล์ backup จาก container
    docker cp "${CONTAINER_NAME}:/tmp/mongodb_backup/${MONGO_DB}" "$MONGO_BACKUP_DIR/"
    
    # ลบไฟล์ชั่วคราวใน container
    docker exec "$CONTAINER_NAME" rm -rf /tmp/mongodb_backup
    
    echo -e "${GREEN}✓ Backup MongoDB สำเร็จ${NC}"
else
    echo -e "${RED}✗ Backup MongoDB ล้มเหลว${NC}"
    exit 1
fi

# สร้างไฟล์ metadata
METADATA_FILE="$BACKUP_DIR/backup-info.txt"
cat > "$METADATA_FILE" << EOF
========================================
SciHome Database Backup Information
========================================
วันที่และเวลา: $(date)
Timestamp: $TIMESTAMP
โฟลเดอร์ backup: $BACKUP_DIR

ข้อมูล MongoDB:
- Database: $MONGO_DB
- User: $MONGO_USER
- Container: $CONTAINER_NAME

ขนาดโฟลเดอร์ backup:
$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "N/A")
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Backup เสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "โฟลเดอร์ backup: $BACKUP_DIR"
echo "ขนาด: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"
echo ""
echo -e "${GREEN}เสร็จสิ้น!${NC}"




