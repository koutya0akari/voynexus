import { supabaseAdmin } from "@/lib/supabase-admin";

const TABLE_NAME = "metered_passes";

export type MeteredPassRecord = {
  id: string;
  planCode: string;
  remainingUses: number;
  expiresAt: string | null;
  source?: string | null;
  notes?: string | null;
};

export type MeteredPassSummary = {
  totalRemaining: number;
  passes: MeteredPassRecord[];
};

export type ConsumeResult =
  | {
      ok: true;
      remaining: number;
    }
  | {
      ok: false;
      remaining: number;
      error?: string;
    };

export async function getMeteredPassSummary(googleUserId: string): Promise<MeteredPassSummary> {
  if (!supabaseAdmin) {
    return { totalRemaining: 0, passes: [] };
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("id, plan_code, remaining_uses, expires_at, source, notes")
    .eq("google_user_id", googleUserId)
    .order("expires_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load metered passes", error);
    return { totalRemaining: 0, passes: [] };
  }

  const passes =
    data?.map((row) => ({
      id: row.id as string,
      planCode: row.plan_code as string,
      remainingUses: Number(row.remaining_uses ?? 0),
      expiresAt: row.expires_at ?? null,
      source: row.source ?? undefined,
      notes: row.notes ?? undefined,
    })) ?? [];

  const totalRemaining = passes.reduce((sum, pass) => sum + Math.max(pass.remainingUses, 0), 0);
  return { totalRemaining, passes };
}

export async function consumeMeteredPassUse(googleUserId: string): Promise<ConsumeResult> {
  if (!supabaseAdmin) {
    return { ok: false, remaining: 0, error: "Supabase is not configured." };
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("id, remaining_uses")
    .eq("google_user_id", googleUserId)
    .gt("remaining_uses", 0)
    .order("expires_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load metered pass for consumption", error);
    return { ok: false, remaining: 0, error: "Unable to read metered pass." };
  }

  if (!data) {
    return { ok: false, remaining: 0, error: "No remaining metered passes." };
  }

  const nowIso = new Date().toISOString();
  const newRemaining = Math.max(0, Number(data.remaining_uses ?? 0) - 1);
  const { error: updateError } = await supabaseAdmin
    .from(TABLE_NAME)
    .update({
      remaining_uses: newRemaining,
      updated_at: nowIso,
      last_redeemed_at: nowIso,
    })
    .eq("id", data.id)
    .gt("remaining_uses", 0);

  if (updateError) {
    console.error("Failed to decrement metered pass usage", updateError);
    return { ok: false, remaining: 0, error: "Failed to decrement metered pass." };
  }

  const summary = await getMeteredPassSummary(googleUserId);
  return { ok: true, remaining: summary.totalRemaining };
}
