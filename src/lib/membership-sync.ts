import { cookies } from "next/headers";
import { createMembershipToken } from "@/lib/membership-token";
import { getMembershipByGoogleUserId } from "@/lib/membership-store";

export async function ensureMembershipCookie(googleUserId?: string) {
  if (!googleUserId) {
    return;
  }
  const cookieStore = cookies();
  const existingToken = cookieStore.get("membership_token");
  if (existingToken?.value) {
    return;
  }

  try {
    const record = await getMembershipByGoogleUserId(googleUserId);
    if (!record) {
      return;
    }
    const token = createMembershipToken(record.stripeCustomerId);
    cookieStore.set({
      name: "membership_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  } catch (error) {
    console.error("Failed to ensure membership cookie", error);
  }
}
