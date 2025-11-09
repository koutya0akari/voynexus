import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    revision: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    lastUpdated: new Date().toISOString()
  });
}
