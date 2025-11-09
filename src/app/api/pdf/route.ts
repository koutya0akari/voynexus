import { NextResponse } from "next/server";
import { z } from "zod";
import { buildItineraryPdf } from "@/lib/pdf";

const schema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  timeline: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      note: z.string().optional()
    })
  ),
  warnings: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pdfBuffer = await buildItineraryPdf(parsed.data);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="itinerary.pdf"`
    }
  });
}
