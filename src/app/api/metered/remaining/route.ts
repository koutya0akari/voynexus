import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMeteredPassSummary } from "@/lib/metered-pass-store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ totalRemaining: 0, passes: [] }, { status: 401 });
  }

  const summary = await getMeteredPassSummary(session.user.id);
  return NextResponse.json(summary);
}
