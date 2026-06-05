import { ensureUser } from "@/app/actions/user";
import { createClient } from "@/lib/supabase/client";

export async function ensureAnonymousSession(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return;

  const { error } = await supabase.auth.signInAnonymously();
  if (!error) {
    await ensureUser();
  }
}
