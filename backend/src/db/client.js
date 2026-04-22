import pg from "pg";
import { loadEnv } from "../loadEnv.js";

loadEnv();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
