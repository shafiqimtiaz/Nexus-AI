import "server-only";
import { cache } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export type Role = "owner" | "demo";

// Owner = Supabase Auth session present; anyone else = read-only demo.
// Display-only gating: reads the session from cookies (no auth-server round
// trip) so page renders stay fast. cache() dedupes layout + page calls within
// a single request. Mutations must use requireOwner(), which verifies.
export const getRole = cache(async (): Promise<Role> => {
  const supabase = await createAuthClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? "owner" : "demo";
});

// Mutation route handlers call this first and early-return the Response if
// non-null. Demo users get a 403; owners get null (proceed). Verifies the
// token against the auth server — a forged session cookie must not pass.
export async function requireOwner(): Promise<Response | null> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Demo mode is read-only" }, { status: 403 });
  }
  return null;
}
