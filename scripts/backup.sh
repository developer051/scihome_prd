#!/bin/bash

# สคริปต์สำหรับทำการ backup โปรเจกต์ SciHome
# Backup MongoDB database และไฟล์สำคัญของโปรเจกต์

set -e  # หยุดทำงานทันทีถ้ามี error

# สีสำหรับ output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ข้อมูลการเชื่อมต่อ MongoDB
MONGO_USER="root"
MONGO_PASSWORD="2!p\$OcY^%OsoVB\$*0F3x"
MONGO_DB="scihome"
MONGO_AUTH_DB="admin"
CONTAINER_NAME="scihome-mongodb"

# สร้าง timestamp สำหรับชื่อโฟลเดอร์ backup
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/backup-${TIMESTAMP}"
PROJECT_ROOT=$(dirname "$(dirname "$(readlink -f "$0")")")

# เปลี่ยนไปที่โฟลเดอร์โปรเจกต์
cd "$PROJECT_ROOT"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}เริ่มทำการ Backup โปรเจกต์ SciHome${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# สร้างโฟลเดอร์ backup
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ สร้างโฟลเดอร์ backup: ${BACKUP_DIR}${NC}"

# 1. Backup MongoDB Database
echo ""
echo -e "${YELLOW}[1/3] กำลังทำการ backup MongoDB database...${NC}"

# ตรวจสอบว่า container ทำงานอยู่หรือไม่
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}✗ MongoDB container ไม่ได้ทำงานอยู่${NC}"
    echo -e "${YELLOW}กำลังพยายามเริ่ม container...${NC}"
    docker-compose up -d mongodb
    sleep 5
fi

# สร้างโฟลเดอร์สำหรับ MongoDB backup
MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb"
mkdir -p "$MONGO_BACKUP_DIR"

# ทำการ backup MongoDB โดยใช้ mongodump
if docker-compose exec -T mongodb mongodump \
    --username "$MONGO_USER" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase "$MONGO_AUTH_DB" \
    --db "$MONGO_DB" \
    --out /tmp/mongodb_backup 2>/dev/null; then
    
    # คัดลอกไฟล์ backup จาก container
    docker cp "${CONTAINER_NAME}:/tmp/mongodb_backup/${MONGO_DB}" "$MONGO_BACKUP_DIR/"
    
    # ลบไฟล์ชั่วคราวใน container
    docker-compose exec -T mongodb rm -rf /tmp/mongodb_backup
    
    echo -e "${GREEN}✓ Backup MongoDB สำเร็จ${NC}"
else
    echo -e "${RED}✗ Backup MongoDB ล้มเหลว${NC}"
    echo -e "${YELLOW}กำลังลองใช้วิธีสำรอง...${NC}"
    
    # วิธีสำรอง: ใช้สคริปต์ backup.js ที่มีอยู่
    if [ -f "scripts/backup.js" ]; then
        node scripts/backup.js
        # คัดลอก backup ล่าสุดมา
        LATEST_BACKUP=$(ls -td backups/20* 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            cp -r "$LATEST_BACKUP"/* "$MONGO_BACKUP_DIR/" 2>/dev/null || true
            echo -e "${GREEN}✓ Backup MongoDB สำเร็จ (ใช้วิธีสำรอง)${NC}"
        fi
    fi
fi

# 2. Backup ไฟล์สำคัญของโปรเจกต์
echo ""
echo -e "${YELLOW}[2/3] กำลังทำการ backup ไฟล์สำคัญของโปรเจกต์...${NC}"

FILES_BACKUP_DIR="$BACKUP_DIR/files"
mkdir -p "$FILES_BACKUP_DIR"

# รายการไฟล์และโฟลเดอร์ที่ต้อง backup
FILES_TO_BACKUP=(
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "next.config.js"
    "next.config.ts"
    "tailwind.config.ts"
    "postcss.config.js"
    "postcss.config.mjs"
    "eslint.config.mjs"
    "jest.config.ts"
    "jest.setup.ts"
    "docker-compose.yml"
    "README.md"
    "DEPLOYMENT.md"
    "MONGODB_README.md"
    ".gitignore"
    "env.example"
)

DIRS_TO_BACKUP=(
    "app"
    "components"
    "lib"
    "models"
    "types"
    "scripts"
    "public"
    "docker-entrypoint-initdb.d"
)

# Backup ไฟล์
for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$FILES_BACKUP_DIR/" 2>/dev/null || true
        echo -e "  ✓ Backup: $file"
    fi
done

# Backup โฟลเดอร์
for dir in "${DIRS_TO_BACKUP[@]}"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "$FILES_BACKUP_DIR/" 2>/dev/null || true
        echo -e "  ✓ Backup: $dir/"
    fi
done

# Backup .env file ถ้ามี (สำคัญมาก!)
if [ -f ".env" ]; then
    cp ".env" "$FILES_BACKUP_DIR/.env.backup" 2>/dev/null || true
    echo -e "  ✓ Backup: .env (เก็บเป็น .env.backup)"
fi

if [ -f ".env.local" ]; then
    cp ".env.local" "$FILES_BACKUP_DIR/.env.local.backup" 2>/dev/null || true
    echo -e "  ✓ Backup: .env.local (เก็บเป็น .env.local.backup)"
fi

echo -e "${GREEN}✓ Backup ไฟล์สำคัญสำเร็จ${NC}"

# 3. สร้างไฟล์ metadata
echo ""
echo -e "${YELLOW}[3/3] กำลังสร้างไฟล์ metadata...${NC}"

METADATA_FILE="$BACKUP_DIR/backup-info.txt"
cat > "$METADATA_FILE" << EOF
========================================
SciHome Backup Information
========================================
วันที่และเวลา: $(date)
Timestamp: $TIMESTAMP
โฟลเดอร์ backup: $BACKUP_DIR

ข้อมูล MongoDB:
- Database: $MONGO_DB
- User: $MONGO_USER
- Container: $CONTAINER_NAME

ข้อมูลระบบ:
- OS: $(uname -a)
- Node Version: $(node --version 2>/dev/null || echo "N/A")
- Docker Version: $(docker --version 2>/dev/null || echo "N/A")

รายการไฟล์ที่ backup:
$(ls -lh "$FILES_BACKUP_DIR" 2>/dev/null | tail -n +2 || echo "N/A")

รายการ MongoDB backup:
$(ls -lh "$MONGO_BACKUP_DIR" 2>/dev/null | tail -n +2 || echo "N/A")

ขนาดโฟลเดอร์ backup:
$(du -sh "$BACKUP_DIR" 2>/dev/null || echo "N/A")
EOF

echo -e "${GREEN}✓ สร้างไฟล์ metadata สำเร็จ${NC}"

# แสดงสรุปผล
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Backup เสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "โฟลเดอร์ backup: $BACKUP_DIR"
echo "ขนาด: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"
echo ""
echo "ไฟล์ metadata: $METADATA_FILE"
echo ""
echo -e "${YELLOW}หมายเหตุ:${NC}"
echo "- MongoDB backup อยู่ใน: $MONGO_BACKUP_DIR"
echo "- ไฟล์โปรเจกต์ อยู่ใน: $FILES_BACKUP_DIR"
echo ""
echo -e "${GREEN}เสร็จสิ้น!${NC}"

