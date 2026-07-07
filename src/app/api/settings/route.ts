import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { BASE_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

const AI_RULES_KEY = "ai_rules";

// GET /api/settings — returns the owner's custom AI rules plus the locked base
// system prompt so the Options page can show what the agent already follows.
export async function GET() {
  const db = createServerClient();
  const { data } = await db
    .from("app_settings")
    .select("key, value")
    .eq("key", AI_RULES_KEY)
    .maybeSingle();

  return Response.json({
    aiRules: data?.value ?? "",
    basePrompt: BASE_SYSTEM_PROMPT,
  });
}

// POST /api/settings — both roles. Saves the custom AI rules (append-only; the
// base prompt is never editable). Select-then-update/insert instead of upsert so
// it works against both the real client and the mock DB.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const value = typeof body?.aiRules === "string" ? body.aiRules : "";

  const db = createServerClient();
  const { data: existing } = await db
    .from("app_settings")
    .select("id")
    .eq("key", AI_RULES_KEY)
    .maybeSingle();

  if (existing) {
    const { error } = await db
      .from("app_settings")
      .update({ value })
      .eq("key", AI_RULES_KEY);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await db.from("app_settings").insert({ key: AI_RULES_KEY, value });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ aiRules: value });
}
