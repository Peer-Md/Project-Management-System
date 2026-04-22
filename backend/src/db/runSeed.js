import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.resolve(__dirname, "../../db/seeds/mep_demo_seed.sql");

async function run() {
  const sql = await fs.readFile(seedPath, "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("Seed completed.");
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
