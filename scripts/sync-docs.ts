#!/usr/bin/env node
/**
 * Script to sync versioned lmms-eval documentation from GitHub.
 * Run with: pnpm run sync-docs
 */

import { config } from "dotenv";
import { syncVersionedDocs } from "../lib/sync-lmms-eval-docs";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn("GITHUB_TOKEN not set. API rate limits may apply.");
    console.warn("Set GITHUB_TOKEN in .env.local for higher limits.\n");
  }

  const force = process.argv.includes("--force");
  if (force) {
    console.log("Force mode: re-syncing ALL versions (overwriting existing)\n");
  }
  await syncVersionedDocs(token, { force });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
