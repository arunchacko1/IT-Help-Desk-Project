const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dataDir = process.env.VERCEL
  ? path.join("/tmp", "helpdesk-data")
  : path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "helpdesk.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

let db;

async function getDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await db.exec("PRAGMA foreign_keys = ON;");
  }

  return db;
}

async function initializeSchema() {
  const database = await getDb();
  const schema = fs.readFileSync(schemaPath, "utf8");
  await database.exec(schema);
  return database;
}

module.exports = {
  getDb,
  initializeSchema,
  dbPath
};
