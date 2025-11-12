import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createMembershipToken } from "@/lib/membership-token";
import { getMembershipByGoogleUserId } from "@/lib/membership-store";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Googleアカウントでログインしてください。" },
      { status: 401 }
    );
  }

  const record = await getMembershipByGoogleUserId(session.user.id);
  if (!record) {
    return NextResponse.json({ error: "有効な会員情報が見つかりませんでした。" }, { status: 404 });
  }

  try {
    const token = createMembershipToken(record.stripeCustomerId);
    const response = NextResponse.json({
      memberId: record.stripeCustomerId,
      email: record.email,
      membershipExpiresAt: record.membershipExpiresAt.toISOString(),
    });
    response.cookies.set({
      name: "membership_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return response;
  } catch (error) {
    console.error("Failed to create membership token during sync", error);
    return NextResponse.json({ error: "会員トークンの生成に失敗しました。" }, { status: 500 });
  }
}
