import { NextRequest, NextResponse } from "next/server";
import { syncLmmsEvalDocs } from "@/lib/sync-lmms-eval-docs";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Verify GitHub webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * POST /api/sync-docs
 * Webhook endpoint for GitHub to trigger doc sync
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = request.headers.get("x-hub-signature-256");
      const payload = await request.text();

      if (!signature || !verifySignature(payload, signature, webhookSecret)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Sync docs from GitHub
    const token = process.env.GITHUB_TOKEN;
    await syncLmmsEvalDocs(token);

    // Revalidate all lmms-eval doc pages
    revalidatePath("/docs/lmms-eval", "layout");

    return NextResponse.json({
      success: true,
      message: "Docs synced successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync-docs
 * Manual trigger endpoint (for testing)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    const authHeader = request.headers.get("authorization");
    const expectedAuth = process.env.SYNC_API_KEY;

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.GITHUB_TOKEN;
    await syncLmmsEvalDocs(token);

    revalidatePath("/docs/lmms-eval", "layout");

    return NextResponse.json({
      success: true,
      message: "Docs synced successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
