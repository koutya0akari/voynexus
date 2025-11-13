import { NextResponse } from "next/server";
import { z } from "zod";
import { generateChatResponse } from "@/lib/ai";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";
import { verifyMembership } from "@/lib/membership";
import { consumeMeteredPassUse } from "@/lib/metered-pass-store";

const bodySchema = z.object({
  lang: z.string().default(defaultLocale),
  userQuery: z.string().min(4),
  userContext: z.string().optional(),
});

export async function POST(request: Request) {
  const membership = await verifyMembership(request);
  if (!membership.ok) {
    return NextResponse.json({ error: membership.message }, { status: membership.status });
  }

  let meteredUsesRemaining: number | undefined;
  if (membership.accessType === "metered" && membership.linkedGoogleUserId) {
    const consumption = await consumeMeteredPassUse(membership.linkedGoogleUserId);
    if (!consumption.ok) {
      return NextResponse.json({ error: "従量パスの残回数がありません。" }, { status: 402 });
    }
    meteredUsesRemaining = consumption.remaining;
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lang = isSupportedLocale(parsed.data.lang) ? parsed.data.lang : defaultLocale;

  const result = await generateChatResponse({
    lang,
    userQuery: parsed.data.userQuery,
    userContext: parsed.data.userContext,
  });

  return NextResponse.json({
    ...result,
    meteredUsesRemaining,
  });
}
