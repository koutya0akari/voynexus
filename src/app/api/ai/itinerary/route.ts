import { NextResponse } from "next/server";
import { z } from "zod";
import { generateItinerary } from "@/lib/ai";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";
import { verifyMembership } from "@/lib/membership";

const schema = z.object({
  lang: z.string().default(defaultLocale),
  start: z.string(),
  end: z.string(),
  transport: z.string(),
  budget: z.number().min(0),
  party: z.string(),
  interests: z.string(),
  weather: z.string(),
  tidesHint: z.string().optional()
});

export async function POST(request: Request) {
  const membership = await verifyMembership(request);
  if (!membership.ok) {
    return NextResponse.json({ error: membership.message }, { status: membership.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid JSON in itinerary request", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lang = isSupportedLocale(parsed.data.lang) ? parsed.data.lang : defaultLocale;
  const result = await generateItinerary({ ...parsed.data, lang });

  return NextResponse.json(result);
}
