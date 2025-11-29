#!/bin/bash

# สคริปต์สำหรับ backup MongoDB database อัตโนมัติ
# ใช้งาน: bash scripts/auto-backup.sh
# สคริปต์นี้จะไม่หยุดการทำงานของแอปพลิเคชันแม้ว่า backup จะล้มเหลว

set +e  # ไม่หยุดการทำงานแม้ว่าจะมี error

# สีสำหรับ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}เริ่มทำการ Backup Database อัตโนมัติ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# สร้างโฟลเดอร์ backup
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ สร้างโฟลเดอร์ backup: ${BACKUP_DIR}${NC}"

# ตรวจสอบว่า container ทำงานอยู่หรือไม่
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}⚠ MongoDB container ไม่ได้ทำงานอยู่${NC}"
    echo -e "${YELLOW}กำลังพยายามเริ่ม container...${NC}"
    if docker-compose up -d mongodb 2>/dev/null; then
        sleep 5
        echo -e "${GREEN}✓ เริ่ม container สำเร็จ${NC}"
    else
        echo -e "${RED}✗ ไม่สามารถเริ่ม container ได้ - ข้ามการ backup${NC}"
        exit 0  # ออกจากสคริปต์โดยไม่ทำให้ npm script หยุดทำงาน
    fi
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
    if docker cp "${CONTAINER_NAME}:/tmp/mongodb_backup/${MONGO_DB}" "$MONGO_BACKUP_DIR/" 2>/dev/null; then
        # ลบไฟล์ชั่วคราวใน container
        docker exec "$CONTAINER_NAME" rm -rf /tmp/mongodb_backup 2>/dev/null
        
        echo -e "${GREEN}✓ Backup MongoDB สำเร็จ${NC}"
        
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
    else
        echo -e "${RED}✗ ไม่สามารถคัดลอกไฟล์ backup จาก container ได้${NC}"
        exit 0  # ออกจากสคริปต์โดยไม่ทำให้ npm script หยุดทำงาน
    fi
else
    echo -e "${RED}✗ Backup MongoDB ล้มเหลว - ข้ามการ backup${NC}"
    exit 0  # ออกจากสคริปต์โดยไม่ทำให้ npm script หยุดทำงาน
fi

exit 0

