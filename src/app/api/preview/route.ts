import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const langParam = request.nextUrl.searchParams.get("lang") ?? defaultLocale;

  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const lang = isSupportedLocale(langParam) ? langParam : defaultLocale;

  draftMode().enable();

  const redirectUrl = new URL(`/${lang}/${slug}`, request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl);
}
