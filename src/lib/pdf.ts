import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type PdfTimeline = {
  time: string;
  title: string;
  note?: string;
};

export async function buildItineraryPdf(input: {
  title: string;
  summary?: string;
  timeline: PdfTimeline[];
  warnings?: string[];
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFontSize = 22;
  const textFontSize = 12;

  let y = 800;
  page.drawText(input.title, { x: 40, y, size: titleFontSize, font, color: rgb(0.12, 0.24, 0.33) });
  y -= 30;

  if (input.summary) {
    page.drawText(input.summary, { x: 40, y, size: textFontSize, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 24;
  }

  page.drawText("Timeline", { x: 40, y, size: 14, font, color: rgb(0.12, 0.24, 0.33) });
  y -= 20;

  input.timeline.forEach((stop) => {
    page.drawText(`${stop.time} ${stop.title}`, { x: 40, y, size: textFontSize, font });
    y -= 16;
    if (stop.note) {
      page.drawText(stop.note, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
    }
    y -= 4;
  });

  if (input.warnings?.length) {
    y -= 10;
    page.drawText("Warnings", { x: 40, y, size: 14, font, color: rgb(0.6, 0.2, 0.2) });
    y -= 18;
    input.warnings.forEach((warning) => {
      page.drawText(`- ${warning}`, { x: 40, y, size: 11, font, color: rgb(0.5, 0.2, 0.2) });
      y -= 14;
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
