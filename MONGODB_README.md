# MongoDB Setup สำหรับโปรเจกต์ SciHome

## ภาพรวม
โปรเจกต์นี้ใช้ MongoDB เป็นฐานข้อมูลหลักสำหรับจัดเก็บข้อมูลเว็บไซต์ โดยรันบน Docker container พร้อมระบบ authentication

## การตั้งค่า

### ข้อมูลการเชื่อมต่อ
- **ฐานข้อมูล:** scihome
- **ผู้ใช้:** root
- **รหัสผ่าน:** 2!p$OcY^%OsoVB$*0F3x
- **Port:** 27017
- **Connection String:** `mongodb://root:2!p$OcY^%OsoVB$*0F3x@localhost:27017/scihome?authSource=admin`

### ไฟล์ที่เกี่ยวข้อง
- `docker-compose.yml` - การตั้งค่า Docker container
- `.env` - Environment variables สำหรับแอปพลิเคชัน
- `docker-entrypoint-initdb.d/init-mongo.js` - สคริปต์เริ่มต้นฐานข้อมูล

## คำสั่งการใช้งาน

### เริ่ม MongoDB Container
```bash
docker-compose up -d
```

### หยุด MongoDB Container
```bash
docker-compose down
```

### ดูสถานะ Container
```bash
docker-compose ps
```

### เข้าถึง MongoDB Shell
```bash
docker-compose exec mongodb mongosh --username root --password '2!p$OcY^%OsoVB$*0F3x' --authenticationDatabase admin scihome
```

### Backup ฐานข้อมูล
```bash
docker-compose exec -T mongodb mongodump --username root --password '2!p$OcY^%OsoVB$*0F3x' --authenticationDatabase admin --db scihome --out /backup
```

### Restore ฐานข้อมูล
```bash
docker-compose exec -T mongodb mongorestore --username root --password '2!p$OcY^%OsoVB$*0F3x' --authenticationDatabase admin --db scihome /backup/scihome
```

## การพัฒนา

### รันแอปพลิเคชันพร้อม MongoDB
```bash
# Terminal 1: เริ่ม MongoDB
docker-compose up -d

# Terminal 2: รัน Next.js development server
npm run dev
```

### Seed ข้อมูลทดสอบ
```bash
npm run seed
```

### Backup/Restore ข้อมูล
```bash
npm run backup
npm run restore
```

## ความปลอดภัย
- ฐานข้อมูลมีระบบ authentication เปิดใช้งาน
- ข้อมูลจะถูกเก็บใน Docker volume `mongodb_data`
- Container จะ restart อัตโนมัติเมื่อระบบ reboot

## การแก้ปัญหา

### ไม่สามารถเชื่อมต่อฐานข้อมูลได้
1. ตรวจสอบว่า container ทำงานอยู่: `docker-compose ps`
2. ตรวจสอบ logs: `docker-compose logs mongodb`
3. รีสตาร์ท container: `docker-compose restart`

### ลืมรหัสผ่าน
หากจำเป็นต้องเปลี่ยนรหัสผ่าน สามารถแก้ไขใน `docker-compose.yml` และ rebuild container:
```bash
docker-compose down -v  # ลบ volume ด้วย
docker-compose up -d
```

