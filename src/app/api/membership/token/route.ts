import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyMembershipToken } from "@/lib/membership-token";

const schema = z.object({ token: z.string() });

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const info = verifyMembershipToken(parsed.data.token);
  if (!info) {
    return NextResponse.json({ error: "Invalid membership token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "membership_token",
    value: parsed.data.token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90
  });
  return response;
}
