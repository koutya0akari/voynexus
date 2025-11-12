import crypto from "crypto";

const explicitSecret = process.env.MEMBERSHIP_TOKEN_SECRET;
const fallbackSecret = !explicitSecret ? process.env.NEXTAUTH_SECRET : undefined;
export const membershipTokenSecret = explicitSecret ?? fallbackSecret;

if (!explicitSecret && fallbackSecret) {
  console.warn(
    "MEMBERSHIP_TOKEN_SECRET is missing; falling back to NEXTAUTH_SECRET for membership tokens."
  );
}

if (!membershipTokenSecret) {
  console.error("MEMBERSHIP_TOKEN_SECRET is not configured and no fallback secret is available.");
}

export function createMembershipToken(customerId: string, ttlDays = 30) {
  if (!membershipTokenSecret) {
    throw new Error("MEMBERSHIP_TOKEN_SECRET is not configured.");
  }

  const payload = {
    customerId,
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", membershipTokenSecret).update(base).digest("base64url");
  return `${base}.${sig}`;
}

export function verifyMembershipToken(
  token: string | null | undefined
): { customerId: string } | null {
  if (!token || !membershipTokenSecret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base, sig] = parts;
  const expected = crypto
    .createHmac("sha256", membershipTokenSecret)
    .update(base)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf8")) as {
      customerId: string;
      exp: number;
    };
    if (!payload.customerId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return { customerId: payload.customerId };
  } catch (error) {
    console.error("Failed to parse membership token", error);
    return null;
  }
}
