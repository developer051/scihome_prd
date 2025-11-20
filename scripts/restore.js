const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const DEFAULT_URI = "mongodb://localhost:27017/scihome";
const uri = process.env.MONGODB_URI || DEFAULT_URI;
const explicitDb = process.env.MONGODB_DB;

const deriveDbName = (connectionString) => {
  if (explicitDb) {
    return explicitDb;
  }
  try {
    const parsed = new URL(connectionString);
    const pathname = parsed.pathname.replace(/^\//, "");
    return pathname || "scihome";
  } catch {
    return "scihome";
  }
};

const dbName = deriveDbName(uri);

const readJson = async (filePath) => {
  const content = await fs.promises.readFile(filePath, "utf8");
  return JSON.parse(content);
};

const exitWithError = (message, error) => {
  console.error(`❌ ${message}`);
  if (error) {
    console.error(error);
  }
  process.exitCode = 1;
  process.exit(1);
};

const restore = async (backupDir) => {
  const client = new MongoClient(uri);
  
  try {
    console.log(`🔌 Connecting to MongoDB: ${uri.replace(/\/\/.*@/, '//***@')}`);
    await client.connect();
    const db = client.db(dbName);

    // อ่าน metadata
    const metadataPath = path.join(backupDir, "backup-meta.json");
    if (!fs.existsSync(metadataPath)) {
      exitWithError(`Backup metadata not found at ${metadataPath}`);
    }

    const metadata = await readJson(metadataPath);
    console.log(`\n📋 Backup Information:`);
    console.log(`   Database: ${metadata.database}`);
    console.log(`   Created: ${metadata.createdAt}`);
    console.log(`   Collections: ${metadata.collectionCount}`);
    console.log(`   Collections: ${metadata.collections.join(", ")}\n`);

    // Restore แต่ละ collection
    let totalRestored = 0;
    
    for (const collectionName of metadata.collections) {
      const jsonPath = path.join(backupDir, `${collectionName}.json`);
      
      if (!fs.existsSync(jsonPath)) {
        console.warn(`⚠️  Warning: ${collectionName}.json not found, skipping...`);
        continue;
      }

      console.log(`📥 Restoring collection '${collectionName}'...`);
      
      try {
        const documents = await readJson(jsonPath);
        
        if (!Array.isArray(documents)) {
          console.warn(`⚠️  Warning: ${collectionName}.json is not an array, skipping...`);
          continue;
        }

        if (documents.length === 0) {
          console.log(`   ℹ️  No documents to restore`);
          continue;
        }

        // ลบ collection เดิม (ถ้ามี) และสร้างใหม่
        const collection = db.collection(collectionName);
        await collection.deleteMany({});
        
        // แปลง _id จาก string เป็น ObjectId ถ้าจำเป็น
        const processedDocs = documents.map(doc => {
          if (doc._id && typeof doc._id === 'string') {
            const { ObjectId } = require('mongodb');
            try {
              doc._id = new ObjectId(doc._id);
            } catch (e) {
              // ถ้าไม่สามารถแปลงเป็น ObjectId ได้ ให้เก็บเป็น string
            }
          }
          return doc;
        });

        // Insert ข้อมูล
        if (processedDocs.length > 0) {
          await collection.insertMany(processedDocs);
          console.log(`   ✅ Restored ${processedDocs.length} documents`);
          totalRestored += processedDocs.length;
        }
      } catch (error) {
        console.error(`   ❌ Error restoring ${collectionName}:`, error.message);
      }
    }

    console.log(`\n✅ Restore completed successfully!`);
    console.log(`   Total documents restored: ${totalRestored}`);
    console.log(`   Database: ${dbName}`);
    
  } catch (error) {
    exitWithError("Restore failed.", error);
  } finally {
    await client.close().catch(() => {});
  }
};

// รับ backup directory จาก command line argument
const backupDirArg = process.argv[2];

if (!backupDirArg) {
  console.error("❌ Please provide backup directory path");
  console.log("\nUsage: node scripts/restore.js <backup-directory>");
  console.log("Example: node scripts/restore.js backups/2025-11-17T15-36-36-312Z");
  process.exit(1);
}

// แปลง path เป็น absolute path
const backupDir = path.isAbsolute(backupDirArg) 
  ? backupDirArg 
  : path.join(process.cwd(), backupDirArg);

if (!fs.existsSync(backupDir)) {
  exitWithError(`Backup directory not found: ${backupDir}`);
}

if (!fs.statSync(backupDir).isDirectory()) {
  exitWithError(`Path is not a directory: ${backupDir}`);
}

console.log(`📦 Restoring from: ${backupDir}\n`);
restore(backupDir);

