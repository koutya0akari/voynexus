import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { path = "/", lang = defaultLocale, tags = [] } = body;

  const locale = isSupportedLocale(lang) ? lang : defaultLocale;
  revalidatePath(`/${locale}${path}`);
  tags.forEach((tag: string) => revalidateTag(tag));

  return NextResponse.json({ revalidated: true, path, locale });
}
