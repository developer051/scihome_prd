# คู่มือการ Backup Database อัตโนมัติ

## ภาพรวม

ระบบ backup อัตโนมัติสำหรับ MongoDB database ที่จะทำงานในสองกรณี:
1. **อัตโนมัติเมื่อรันแอปพลิเคชัน**: Backup จะทำงานทุกครั้งที่รัน `npm run dev` หรือ `npm run start`
2. **อัตโนมัติทุกวันเวลา 01:00**: Backup จะทำงานทุกวันเวลา 01:00 น. ผ่าน cron job

## ไฟล์ที่เกี่ยวข้อง

- `scripts/auto-backup.sh` - สคริปต์หลักสำหรับ backup อัตโนมัติ
- `scripts/setup-cron-backup.sh` - สคริปต์สำหรับตั้งค่า cron job
- `scripts/remove-cron-backup.sh` - สคริปต์สำหรับลบ cron job
- `backups/` - โฟลเดอร์ที่เก็บไฟล์ backup ทั้งหมด

## การใช้งาน

### 1. Backup อัตโนมัติเมื่อรันแอปพลิเคชัน

ระบบจะทำงานอัตโนมัติเมื่อคุณรัน:
```bash
npm run dev
# หรือ
npm run start
```

Backup จะทำงานก่อนที่แอปพลิเคชันจะเริ่มทำงาน และจะไม่หยุดการทำงานของแอปพลิเคชันแม้ว่า backup จะล้มเหลว

### 2. Backup ด้วยตนเอง

คุณสามารถรัน backup ด้วยตนเองได้ด้วยคำสั่ง:
```bash
npm run backup:auto
# หรือ
bash scripts/auto-backup.sh
```

### 3. ตั้งค่า Cron Job สำหรับ Backup ทุกวันเวลา 01:00

#### ตั้งค่า Cron Job
```bash
npm run cron:setup
# หรือ
bash scripts/setup-cron-backup.sh
```

#### ตรวจสอบ Cron Job
```bash
crontab -l
```

#### ดู Log ของ Cron Job
```bash
tail -f logs/cron-backup.log
```

#### ลบ Cron Job
```bash
npm run cron:remove
# หรือ
bash scripts/remove-cron-backup.sh
```

## โครงสร้างไฟล์ Backup

ไฟล์ backup จะถูกเก็บในโฟลเดอร์ `backups/` โดยมีรูปแบบชื่อโฟลเดอร์ดังนี้:
```
backups/backup-YYYYMMDD-HHMMSS/
├── mongodb/
│   └── scihome/
│       ├── collections/
│       └── ...
└── backup-info.txt
```

## ข้อมูลการเชื่อมต่อ

- **Database**: scihome
- **User**: root
- **Container**: scihome-mongodb
- **Authentication Database**: admin

## หมายเหตุ

- Backup script จะไม่หยุดการทำงานของแอปพลิเคชันแม้ว่า backup จะล้มเหลว
- หาก MongoDB container ไม่ได้ทำงานอยู่ ระบบจะพยายามเริ่ม container อัตโนมัติ
- Log ของ cron job จะถูกบันทึกที่ `logs/cron-backup.log`
- ควรตรวจสอบ log เป็นประจำเพื่อให้แน่ใจว่า backup ทำงานได้อย่างถูกต้อง

## การแก้ไขปัญหา

### Backup ไม่ทำงานเมื่อรัน npm run dev/start
- ตรวจสอบว่า MongoDB container ทำงานอยู่: `docker ps | grep scihome-mongodb`
- ตรวจสอบว่าไฟล์ `scripts/auto-backup.sh` มีสิทธิ์ในการรัน: `chmod +x scripts/auto-backup.sh`

### Cron Job ไม่ทำงาน
- ตรวจสอบว่า cron service ทำงานอยู่: `systemctl status cron` (Ubuntu/Debian) หรือ `systemctl status crond` (CentOS/RHEL)
- ตรวจสอบ log: `tail -f logs/cron-backup.log`
- ตรวจสอบ cron job: `crontab -l`

### ไม่สามารถเข้าถึง MongoDB Container
- ตรวจสอบว่า Docker ทำงานอยู่: `docker ps`
- ตรวจสอบว่า container ทำงานอยู่: `docker ps | grep scihome-mongodb`
- เริ่ม container: `docker-compose up -d mongodb`

