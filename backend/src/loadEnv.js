import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load environment variables from the repo root `.env` when running from the backend workspace.
// This keeps `npm run <script> --workspace backend` working without duplicating config files.
export function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootEnvPath = path.resolve(__dirname, "../../.env");
  const localEnvPath = path.resolve(__dirname, "../.env");

  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
    return;
  }

  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
    return;
  }

  dotenv.config();
}

