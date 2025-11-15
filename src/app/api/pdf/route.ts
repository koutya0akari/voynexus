import { NextResponse } from "next/server";
import { z } from "zod";
import { buildItineraryPdf } from "@/lib/pdf";

export const runtime = "nodejs";

const detailSchema = z
  .object({
    window: z.string().optional(),
    area: z.string().optional(),
    pace: z.string().optional(),
    transport: z.string().optional(),
    party: z.string().optional(),
    budget: z.string().optional(),
    weather: z.string().optional(),
    dining: z.string().optional(),
    mustVisit: z.string().optional(),
    cautions: z.string().optional(),
  })
  .optional();

const referenceSchema = z
  .array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
    })
  )
  .optional();

const warningsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const normalized = Array.isArray(value) ? value : [value];
    const cleaned = normalized
      .map((warning) => warning.trim())
      .filter((warning) => Boolean(warning.length));
    return cleaned.length ? cleaned : undefined;
  });

const schema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  details: detailSchema,
  timeline: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      duration: z.number().min(0).optional(),
      note: z.string().optional(),
    })
  ),
  warnings: warningsSchema,
  references: referenceSchema,
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch (error) {
    console.error("Invalid JSON in /api/pdf", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const pdfBytes = await buildItineraryPdf(parsed.data);
    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(pdfBuffer).set(pdfBytes);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="itinerary.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to build itinerary PDF", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
