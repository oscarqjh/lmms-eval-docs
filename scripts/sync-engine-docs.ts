import { config } from "dotenv";
import { syncLmmsEngineDocs } from "../lib/sync-lmms-engine-docs";

// Load environment variables from .env.local
config({ path: ".env.local" });

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.warn("⚠️  GITHUB_TOKEN not set. API rate limits may apply.");
  console.warn("   Set GITHUB_TOKEN in .env.local for higher limits.\n");
}

syncLmmsEngineDocs(token)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  });
