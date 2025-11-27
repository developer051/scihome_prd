#!/usr/bin/env node

/**
 * สคริปต์สำหรับทำการ backup โปรเจกต์ SciHome แบบครอบคลุม
 * Backup MongoDB database และไฟล์สำคัญของโปรเจกต์
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

// สีสำหรับ console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

// ข้อมูลการเชื่อมต่อ MongoDB
const MONGO_USER = "root";
const MONGO_PASSWORD = "2!p$OcY^%OsoVB$*0F3x";
const MONGO_DB = "scihome";
const MONGO_AUTH_DB = "admin";
const CONTAINER_NAME = "scihome-mongodb";
const DEFAULT_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/${MONGO_DB}?authSource=${MONGO_AUTH_DB}`;
const uri = process.env.MONGODB_URI || DEFAULT_URI;

// สร้าง timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
const backupDir = path.join(process.cwd(), "backups", `backup-${timestamp}`);

// ไฟล์และโฟลเดอร์ที่ต้อง backup
const FILES_TO_BACKUP = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.js",
  "next.config.ts",
  "tailwind.config.ts",
  "postcss.config.js",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "jest.config.ts",
  "jest.setup.ts",
  "docker-compose.yml",
  "README.md",
  "DEPLOYMENT.md",
  "MONGODB_README.md",
  ".gitignore",
  "env.example",
];

const DIRS_TO_BACKUP = [
  "app",
  "components",
  "lib",
  "models",
  "types",
  "scripts",
  "public",
  "docker-entrypoint-initdb.d",
];

/**
 * สร้างโฟลเดอร์ถ้ายังไม่มี
 */
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`ไม่สามารถสร้างโฟลเดอร์ ${dirPath}: ${error.message}`);
  }
}

/**
 * คัดลอกไฟล์
 */
async function copyFile(src, dest) {
  try {
    await fs.copyFile(src, dest);
    return true;
  } catch (error) {
    log.warn(`ไม่สามารถคัดลอก ${src}: ${error.message}`);
    return false;
  }
}

/**
 * คัดลอกโฟลเดอร์แบบ recursive
 */
async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
    return true;
  } catch (error) {
    log.warn(`ไม่สามารถคัดลอกโฟลเดอร์ ${src}: ${error.message}`);
    return false;
  }
}

/**
 * Backup MongoDB database โดยใช้ mongodump ผ่าน Docker
 */
async function backupMongoDB() {
  const mongoBackupDir = path.join(backupDir, "mongodb");
  await ensureDir(mongoBackupDir);

  log.info("กำลังทำการ backup MongoDB database...");

  try {
    // ตรวจสอบว่า container ทำงานอยู่หรือไม่
    try {
      execSync(`docker ps | grep -q ${CONTAINER_NAME}`, { stdio: "ignore" });
    } catch {
      log.warn("MongoDB container ไม่ได้ทำงานอยู่ กำลังเริ่ม container...");
      execSync("docker-compose up -d mongodb", { stdio: "inherit" });
      // รอให้ container พร้อม
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // ทำการ backup โดยใช้ mongodump
    const backupCmd = `docker-compose exec -T mongodb mongodump --username ${MONGO_USER} --password '${MONGO_PASSWORD}' --authenticationDatabase ${MONGO_AUTH_DB} --db ${MONGO_DB} --out /tmp/mongodb_backup`;
    
    execSync(backupCmd, { stdio: "inherit" });

    // คัดลอกไฟล์ backup จาก container
    const containerBackupPath = `${CONTAINER_NAME}:/tmp/mongodb_backup/${MONGO_DB}`;
    execSync(`docker cp ${containerBackupPath} ${mongoBackupDir}/`, { stdio: "inherit" });

    // ลบไฟล์ชั่วคราวใน container
    execSync(`docker-compose exec -T mongodb rm -rf /tmp/mongodb_backup`, { stdio: "ignore" });

    log.success("Backup MongoDB สำเร็จ");
    return true;
  } catch (error) {
    log.error(`Backup MongoDB ล้มเหลว: ${error.message}`);
    log.warn("กำลังลองใช้วิธีสำรอง (Node.js backup)...");

    // วิธีสำรอง: ใช้การ backup แบบเดิม
    try {
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(MONGO_DB);
      const collections = await db.listCollections().toArray();

      const jsonBackupDir = path.join(mongoBackupDir, "json");
      await ensureDir(jsonBackupDir);

      for (const collection of collections) {
        const name = collection.name;
        const outputPath = path.join(jsonBackupDir, `${name}.json`);
        const docs = await db.collection(name).find({}).toArray();
        await fs.writeFile(outputPath, JSON.stringify(docs, null, 2), "utf8");
        log.info(`  → ${name} (${docs.length} documents)`);
      }

      await client.close();
      log.success("Backup MongoDB สำเร็จ (ใช้วิธีสำรอง)");
      return true;
    } catch (fallbackError) {
      log.error(`Backup MongoDB ล้มเหลวทั้งหมด: ${fallbackError.message}`);
      return false;
    }
  }
}

/**
 * Backup ไฟล์สำคัญของโปรเจกต์
 */
async function backupProjectFiles() {
  const filesBackupDir = path.join(backupDir, "files");
  await ensureDir(filesBackupDir);

  log.info("กำลังทำการ backup ไฟล์สำคัญของโปรเจกต์...");

  let successCount = 0;
  let failCount = 0;

  // Backup ไฟล์
  for (const file of FILES_TO_BACKUP) {
    const srcPath = path.join(process.cwd(), file);
    const destPath = path.join(filesBackupDir, file);

    try {
      await fs.access(srcPath);
      await copyFile(srcPath, destPath);
      successCount++;
    } catch {
      failCount++;
    }
  }

  // Backup โฟลเดอร์
  for (const dir of DIRS_TO_BACKUP) {
    const srcPath = path.join(process.cwd(), dir);
    const destPath = path.join(filesBackupDir, dir);

    try {
      await fs.access(srcPath);
      await copyDir(srcPath, destPath);
      successCount++;
    } catch {
      failCount++;
    }
  }

  // Backup .env files ถ้ามี
  const envFiles = [".env", ".env.local"];
  for (const envFile of envFiles) {
    const srcPath = path.join(process.cwd(), envFile);
    const destPath = path.join(filesBackupDir, `${envFile}.backup`);

    try {
      await fs.access(srcPath);
      await copyFile(srcPath, destPath);
      log.info(`  → ${envFile} (เก็บเป็น ${envFile}.backup)`);
      successCount++;
    } catch {
      // ไม่มีไฟล์ .env ไม่เป็นไร
    }
  }

  log.success(`Backup ไฟล์สำเร็จ (${successCount} รายการ)`);
  if (failCount > 0) {
    log.warn(`${failCount} รายการไม่สามารถ backup ได้`);
  }
}

/**
 * สร้างไฟล์ metadata
 */
async function createMetadata() {
  const metadataPath = path.join(backupDir, "backup-info.json");
  const metadata = {
    createdAt: new Date().toISOString(),
    timestamp: timestamp,
    backupDir: backupDir,
    mongodb: {
      database: MONGO_DB,
      user: MONGO_USER,
      container: CONTAINER_NAME,
    },
    system: {
      os: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
    },
    files: {
      filesBackedUp: FILES_TO_BACKUP.length,
      dirsBackedUp: DIRS_TO_BACKUP.length,
    },
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
  log.success("สร้างไฟล์ metadata สำเร็จ");

  // สร้างไฟล์ text version ด้วย
  const textMetadataPath = path.join(backupDir, "backup-info.txt");
  const textMetadata = `
========================================
SciHome Backup Information
========================================
วันที่และเวลา: ${new Date().toLocaleString("th-TH")}
Timestamp: ${timestamp}
โฟลเดอร์ backup: ${backupDir}

ข้อมูล MongoDB:
- Database: ${MONGO_DB}
- User: ${MONGO_USER}
- Container: ${CONTAINER_NAME}

ข้อมูลระบบ:
- OS: ${process.platform}
- Node Version: ${process.version}
- Working Directory: ${process.cwd()}

ขนาดโฟลเดอร์ backup:
${await getDirSize(backupDir)}
`;

  await fs.writeFile(textMetadataPath, textMetadata, "utf8");
}

/**
 * คำนวณขนาดโฟลเดอร์
 */
async function getDirSize(dirPath) {
  try {
    const { execSync } = require("child_process");
    const size = execSync(`du -sh "${dirPath}" 2>/dev/null | cut -f1`, {
      encoding: "utf8",
    }).trim();
    return size || "N/A";
  } catch {
    return "N/A";
  }
}

/**
 * ฟังก์ชันหลัก
 */
async function main() {
  console.log("\n" + "=".repeat(40));
  console.log("  SciHome Backup Script");
  console.log("=".repeat(40) + "\n");

  try {
    // สร้างโฟลเดอร์ backup
    await ensureDir(backupDir);
    log.success(`สร้างโฟลเดอร์ backup: ${backupDir}`);

    // Backup MongoDB
    await backupMongoDB();

    // Backup ไฟล์โปรเจกต์
    await backupProjectFiles();

    // สร้าง metadata
    await createMetadata();

    // แสดงสรุปผล
    const size = await getDirSize(backupDir);
    console.log("\n" + "=".repeat(40));
    log.success("Backup เสร็จสมบูรณ์!");
    console.log("=".repeat(40));
    console.log(`\nโฟลเดอร์ backup: ${backupDir}`);
    console.log(`ขนาด: ${size}`);
    console.log(`\nไฟล์ metadata:`);
    console.log(`  - ${path.join(backupDir, "backup-info.json")}`);
    console.log(`  - ${path.join(backupDir, "backup-info.txt")}`);
    console.log("\n");
  } catch (error) {
    log.error(`เกิดข้อผิดพลาด: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// รันสคริปต์
if (require.main === module) {
  main().catch((error) => {
    log.error(`เกิดข้อผิดพลาดร้ายแรง: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };

