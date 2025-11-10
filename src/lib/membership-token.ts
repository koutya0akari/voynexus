import crypto from "crypto";

const tokenSecret = process.env.MEMBERSHIP_TOKEN_SECRET;

if (!tokenSecret) {
  console.warn("MEMBERSHIP_TOKEN_SECRET is not configured. Membership tokens cannot be verified securely.");
}

export function createMembershipToken(customerId: string, ttlDays = 30) {
  if (!tokenSecret) {
    throw new Error("MEMBERSHIP_TOKEN_SECRET is not configured.");
  }

  const payload = {
    customerId,
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000
  };
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", tokenSecret).update(base).digest("base64url");
  return `${base}.${sig}`;
}

export function verifyMembershipToken(token: string | null | undefined): { customerId: string } | null {
  if (!token || !tokenSecret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base, sig] = parts;
  const expected = crypto.createHmac("sha256", tokenSecret).update(base).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf8")) as { customerId: string; exp: number };
    if (!payload.customerId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return { customerId: payload.customerId };
  } catch (error) {
    console.error("Failed to parse membership token", error);
    return null;
  }
}
