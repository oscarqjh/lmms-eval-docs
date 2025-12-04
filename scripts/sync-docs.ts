#!/usr/bin/env node
/**
 * Script to sync lmms-eval documentation from GitHub
 * Run with: pnpm run sync-docs
 */

import { config } from "dotenv";
import { syncLmmsEvalDocs } from "../lib/sync-lmms-eval-docs";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn("⚠️  GITHUB_TOKEN not set. API rate limits may apply.");
    console.warn("   Set GITHUB_TOKEN in .env.local for higher limits.\n");
  }

  await syncLmmsEvalDocs(token);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
