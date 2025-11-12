import { supabaseAdmin } from "@/lib/supabase-admin";

const TABLE_NAME = "memberships";

type UpsertMembershipPayload = {
  googleUserId: string;
  email: string;
  stripeCustomerId: string;
  lastPaymentAt: Date;
  membershipExpiresAt: Date;
};

export type UpsertMembershipResult = "linked" | "skipped" | "conflict";

type MembershipRecord = {
  googleUserId: string;
  email: string;
  stripeCustomerId: string;
  lastPaymentAt: Date;
  membershipExpiresAt: Date;
};

export async function upsertMembershipRecord(
  payload: UpsertMembershipPayload
): Promise<UpsertMembershipResult> {
  if (!supabaseAdmin) {
    console.warn("Supabase admin client is not configured; skipping membership upsert.");
    return "skipped";
  }

  const existingRecord = await supabaseAdmin
    .from(TABLE_NAME)
    .select("google_user_id")
    .eq("stripe_customer_id", payload.stripeCustomerId)
    .maybeSingle();

  if (
    existingRecord.data &&
    existingRecord.data.google_user_id &&
    existingRecord.data.google_user_id !== payload.googleUserId
  ) {
    console.warn("Stripe customer is already linked to another Google user; skipping update.");
    return "conflict";
  }

  const { error } = await supabaseAdmin.from(TABLE_NAME).upsert(
    {
      google_user_id: payload.googleUserId,
      email: payload.email,
      stripe_customer_id: payload.stripeCustomerId,
      last_payment_at: payload.lastPaymentAt.toISOString(),
      membership_expires_at: payload.membershipExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "google_user_id" }
  );

  if (error) {
    console.error("Failed to upsert membership record", error);
    throw error;
  }

  return "linked";
}

export async function updateMembershipPeriod(
  stripeCustomerId: string,
  lastPaymentAt: Date,
  membershipExpiresAt: Date
) {
  if (!supabaseAdmin) {
    return;
  }

  const existingRecord = await supabaseAdmin
    .from(TABLE_NAME)
    .select("google_user_id, email")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (existingRecord.error) {
    console.error("Failed to read membership record before update", existingRecord.error);
    return;
  }

  if (!existingRecord.data) {
    console.warn("No membership record found for Stripe customer", { stripeCustomerId });
    return;
  }

  const { error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update({
      last_payment_at: lastPaymentAt.toISOString(),
      membership_expires_at: membershipExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("Failed to update membership period", error);
  }
}

export async function getMembershipByCustomerId(
  stripeCustomerId: string
): Promise<MembershipRecord | null> {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("google_user_id, email, stripe_customer_id, last_payment_at, membership_expires_at")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load membership record", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    googleUserId: data.google_user_id,
    email: data.email,
    stripeCustomerId: data.stripe_customer_id,
    lastPaymentAt: new Date(data.last_payment_at),
    membershipExpiresAt: new Date(data.membership_expires_at),
  };
}

export async function getMembershipByGoogleUserId(
  googleUserId: string
): Promise<MembershipRecord | null> {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("google_user_id, email, stripe_customer_id, last_payment_at, membership_expires_at")
    .eq("google_user_id", googleUserId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load membership record by google id", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    googleUserId: data.google_user_id,
    email: data.email,
    stripeCustomerId: data.stripe_customer_id,
    lastPaymentAt: new Date(data.last_payment_at),
    membershipExpiresAt: new Date(data.membership_expires_at),
  };
}
