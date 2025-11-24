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
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(process.cwd(), "backups", timestamp);

const ensureDir = async (dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const writeJson = async (filePath, data) => {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const createMetadata = (collections) => ({
  createdAt: new Date().toISOString(),
  database: dbName,
  uriHost: (() => {
    try {
      const parsed = new URL(uri);
      return parsed.host;
    } catch {
      return "unknown";
    }
  })(),
  collectionCount: collections.length,
  collections: collections.map((c) => c.name),
});

const exitWithError = (message, error) => {
  console.error(message);
  if (error) {
    console.error(error);
  }
  process.exitCode = 1;
};

const run = async () => {
  const client = new MongoClient(uri);
  try {
    console.log(`Connecting to ${uri}`);
    await client.connect();
    const db = client.db(dbName);

    console.log(`Listing collections from database '${dbName}'`);
    const collections = await db.listCollections().toArray();

    if (!collections.length) {
      console.warn("No collections found.");
    }

    await ensureDir(backupDir);
    console.log(`Writing backup to ${backupDir}`);

    for (const collection of collections) {
      const name = collection.name;
      const outputPath = path.join(backupDir, `${name}.json`);
      console.log(`Exporting collection '${name}'`);
      const docs = await db.collection(name).find({}).toArray();
      await writeJson(outputPath, docs);
      console.log(`  -> ${outputPath} (${docs.length} docs)`);
    }

    const metadataPath = path.join(backupDir, "backup-meta.json");
    await writeJson(metadataPath, createMetadata(collections));
    console.log(`Metadata saved to ${metadataPath}`);

    console.log("Backup completed successfully.");
  } catch (error) {
    exitWithError("Backup failed.", error);
  } finally {
    await client.close().catch(() => {});
  }
};

run();

