import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../db/migrations");

async function run() {
  const files = (await fs.readdir(migrationsDir)).sort();
  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
  await pool.end();
  console.log("Migrations completed.");
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
