import "server-only";
import { cache } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export type Role = "owner" | "demo";

export const getRole = cache(async (): Promise<Role> => {
  const supabase = await createAuthClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? "owner" : "demo";
});

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
