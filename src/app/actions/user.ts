"use server";

import { upsertUser } from "@/lib/auth/upsertUser";
import { createClient } from "@/lib/supabase/server";

export async function ensureUser(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  await upsertUser(user.id, user.email);
  return { success: true };
}
