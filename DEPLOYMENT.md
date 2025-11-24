# คู่มือการ Deploy เว็บไซต์ SciHome

## 🚀 การ Deploy บน Vercel (แนะนำ)

### 1. เตรียมโปรเจกต์
```bash
# Build โปรเจกต์เพื่อตรวจสอบ
npm run build

# ตรวจสอบว่าไม่มี error
npm run lint
```

### 2. Push ไปยัง GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Deploy บน Vercel
1. ไปที่ [vercel.com](https://vercel.com)
2. Sign in ด้วย GitHub
3. คลิก "New Project"
4. เลือก Repository ของคุณ
5. ตั้งค่า Environment Variables:
   - `MONGODB_URI`: MongoDB connection string
   - `NEXTAUTH_SECRET`: Random secret key
   - `NEXTAUTH_URL`: URL ของเว็บไซต์ (เช่น https://your-domain.vercel.app)
6. คลิก "Deploy"

### 4. ตั้งค่า MongoDB Atlas (ถ้าใช้)
1. สร้าง account ที่ [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. สร้าง cluster ใหม่
3. ตั้งค่า Network Access (0.0.0.0/0)
4. สร้าง Database User
5. Copy connection string
6. อัปเดต `MONGODB_URI` ใน Vercel

## 🌐 การ Deploy บน Netlify

### 1. Build โปรเจกต์
```bash
npm run build
```

### 2. Deploy
1. ไปที่ [netlify.com](https://netlify.com)
2. Drag & drop โฟลเดอร์ `out` (ถ้าใช้ static export)
3. หรือเชื่อมต่อกับ GitHub Repository

### 3. ตั้งค่า Environment Variables
ใน Netlify Dashboard:
- Site Settings > Environment Variables
- เพิ่มตัวแปรที่จำเป็น

## 🖥️ การ Deploy บน VPS/Server

### 1. เตรียม Server
```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PM2
sudo npm install -g pm2

# ติดตั้ง MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Upload โปรเจกต์
```bash
# Clone repository
git clone <your-repo-url>
cd scihome

# ติดตั้ง dependencies
npm install

# Build โปรเจกต์
npm run build
```

### 3. ตั้งค่า Environment Variables
```bash
# สร้างไฟล์ .env.local
nano .env.local
```

เพิ่มข้อมูล:
```env
MONGODB_URI=mongodb://localhost:27017/scihome
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://your-domain.com
```

### 4. รันโปรเจกต์
```bash
# รันด้วย PM2
pm2 start npm --name "scihome" -- start

# ตั้งค่าให้รันอัตโนมัติเมื่อ restart server
pm2 startup
pm2 save
```

### 5. ตั้งค่า Nginx (Optional)
```bash
# ติดตั้ง Nginx
sudo apt install nginx

# สร้างไฟล์ configuration
sudo nano /etc/nginx/sites-available/scihome
```

เพิ่มข้อมูล:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/scihome /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 การตั้งค่า SSL Certificate

### ใช้ Let's Encrypt (ฟรี)
```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx

# ขอ SSL Certificate
sudo certbot --nginx -d your-domain.com

# ตั้งค่าให้ต่ออายุอัตโนมัติ
sudo crontab -e
```

เพิ่มบรรทัด:
```cron
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 การ Monitor และ Maintenance

### 1. ตรวจสอบสถานะ
```bash
# ตรวจสอบ PM2 processes
pm2 status

# ดู logs
pm2 logs scihome

# Restart application
pm2 restart scihome
```

### 2. Backup Database
```bash
# สร้าง backup script
nano backup.sh
```

เพิ่มข้อมูล:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db scihome --out /backup/scihome_$DATE
```

```bash
# ให้สิทธิ์ execute
chmod +x backup.sh

# ตั้งค่า cron job
crontab -e
```

เพิ่มบรรทัด:
```cron
0 2 * * * /path/to/backup.sh
```

### 3. ตรวจสอบ Performance
```bash
# ตรวจสอบ memory usage
pm2 monit

# ตรวจสอบ disk space
df -h

# ตรวจสอบ CPU usage
top
```

## 🚨 การแก้ไขปัญหา

### 1. Application ไม่รัน
```bash
# ตรวจสอบ logs
pm2 logs scihome

# ตรวจสอบ port
netstat -tlnp | grep :3000

# Restart application
pm2 restart scihome
```

### 2. Database Connection Error
```bash
# ตรวจสอบ MongoDB status
sudo systemctl status mongod

# ตรวจสอบ MongoDB logs
sudo journalctl -u mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### 3. Memory Issues
```bash
# ตรวจสอบ memory usage
free -h

# ตรวจสอบ PM2 memory usage
pm2 monit

# Restart application
pm2 restart scihome
```

## 📈 การ Optimize Performance

### 1. Enable Gzip Compression
ใน `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  // ... other config
}

module.exports = nextConfig
```

### 2. ตั้งค่า Caching
ใน `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
}
```

### 3. ใช้ CDN
- ใช้ Cloudflare หรือ AWS CloudFront
- ตั้งค่า caching rules
- ใช้ image optimization

## 🔐 การตั้งค่า Security

### 1. Environment Variables
- อย่าเก็บ sensitive data ใน code
- ใช้ strong passwords
- เปลี่ยน default MongoDB port

### 2. Firewall
```bash
# ตั้งค่า UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000
```

### 3. MongoDB Security
```bash
# สร้าง admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

## 📞 การสนับสนุน

หากมีปัญหาการ deploy:
1. ตรวจสอบ logs
2. ตรวจสอบ environment variables
3. ตรวจสอบ database connection
4. สร้าง issue ใน GitHub repository
