import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const DEFAULT_LINE_GAP = 4;
const SECTION_SPACING = 16;
const DETAIL_LABELS: Record<keyof PdfDetails, string> = {
  window: "時間帯",
  area: "訪問エリア・都市",
  pace: "旅のペース",
  transport: "交通手段",
  party: "同行者",
  budget: "予算",
  weather: "天気",
  dining: "食の希望",
  mustVisit: "必ず寄りたい場所",
  cautions: "注意点",
};

type PdfTimeline = {
  time: string;
  title: string;
  duration?: number;
  note?: string;
};

type PdfDetails = {
  window?: string;
  area?: string;
  pace?: string;
  transport?: string;
  party?: string;
  budget?: string;
  weather?: string;
  dining?: string;
  mustVisit?: string;
  cautions?: string;
};

type PdfReference = {
  title: string;
  url?: string;
};

const regularFontPath = path.join(process.cwd(), "public", "fonts", "MPLUS1p-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "public", "fonts", "MPLUS1p-Bold.ttf");

const fontCache: Partial<Record<"regular" | "bold", Uint8Array>> = {};

async function loadFont(weight: "regular" | "bold") {
  if (fontCache[weight]) {
    return fontCache[weight]!;
  }
  const filePath = weight === "regular" ? regularFontPath : boldFontPath;
  const bytes = await readFile(filePath);
  const typed = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  fontCache[weight] = typed;
  return typed;
}

export async function buildItineraryPdf(input: {
  title: string;
  summary?: string;
  details?: PdfDetails;
  timeline: PdfTimeline[];
  warnings?: string[];
  references?: PdfReference[];
}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const pageSize: [number, number] = [595.28, 841.89];
  let page = pdfDoc.addPage(pageSize); // A4 portrait
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const margin = 40;

  const [fontBytes, fontBoldBytes] = await Promise.all([loadFont("regular"), loadFont("bold")]);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: true });

  const addPage = () => {
    page = pdfDoc.addPage(pageSize);
    return pageHeight - margin;
  };

  let y = pageHeight - margin;

  const sectionTitle = (title: string) => {
    if (y - 30 < margin) {
      y = addPage();
    }
    page.drawText(title, {
      x: margin,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0.12, 0.24, 0.33),
    });
    y -= 20;
  };

  // Header background
  const headerHeight = 120;
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: rgb(0.07, 0.4, 0.52),
  });
  page.drawText("voynexus travel OS", {
    x: margin,
    y: pageHeight - 40,
    size: 12,
    font,
    color: rgb(0.9, 0.97, 0.99),
  });
  page.drawText(input.title, {
    x: margin,
    y: pageHeight - 70,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y = pageHeight - headerHeight - 20;

  if (input.summary) {
    const summaryLines = wrapText(input.summary, font, 12, pageWidth - margin * 2);
    const requiredHeight = summaryLines.length * (12 + DEFAULT_LINE_GAP) + SECTION_SPACING;
    if (y - requiredHeight < margin) {
      y = addPage();
    }
    y =
      drawTextBlock(page, summaryLines, {
        x: margin,
        yStart: y,
        font,
        size: 12,
        color: rgb(0.2, 0.2, 0.22),
      }) - SECTION_SPACING;
  }

  const detailEntries = (
    Object.entries(input.details ?? {}) as Array<[keyof PdfDetails, string | undefined]>
  )
    .map(([key, value]) => ({ key, label: DETAIL_LABELS[key] ?? key, value: value?.trim() ?? "" }))
    .filter((entry) => entry.value.length);

  if (detailEntries.length) {
    sectionTitle("旅の条件");
    y -= 6;
    detailEntries.forEach((entry, index) => {
      const lines = wrapText(entry.value, font, 12, pageWidth - margin * 2);
      const blockHeight = 14 + lines.length * (12 + DEFAULT_LINE_GAP) + 12;
      if (y - blockHeight < margin) {
        y = addPage();
        sectionTitle(index === 0 ? "旅の条件" : "旅の条件 (続き)");
        y -= 6;
      }
      page.drawRectangle({
        x: margin,
        y: y - blockHeight + 6,
        width: pageWidth - margin * 2,
        height: blockHeight,
        color: rgb(0.97, 0.99, 1),
      });
      page.drawText(entry.label, {
        x: margin + 12,
        y: y - 16,
        size: 10,
        font: fontBold,
        color: rgb(0.34, 0.45, 0.6),
      });
      y =
        drawTextBlock(page, lines, {
          x: margin + 12,
          yStart: y - 30,
          font,
          size: 12,
          color: rgb(0.1, 0.12, 0.18),
        }) - 18;
    });
  }

  sectionTitle("Timeline");

  const timelineCardWidth = pageWidth - margin * 2;
  input.timeline.forEach((stop) => {
    const noteLines = stop.note ? wrapText(stop.note, font, 11, timelineCardWidth - 24) : [];
    const baseHeight = 48;
    const noteHeight = noteLines.length ? noteLines.length * (11 + DEFAULT_LINE_GAP) + 6 : 0;
    const cardHeight = baseHeight + noteHeight + 16;
    if (y - cardHeight < margin) {
      y = addPage();
      sectionTitle("Timeline (続き)");
    }
    const cardTop = y;
    const cardBottom = y - cardHeight;
    page.drawRectangle({
      x: margin,
      y: cardBottom,
      width: timelineCardWidth,
      height: cardHeight,
      color: rgb(0.98, 0.99, 1),
    });
    page.drawText(stop.time || "-", {
      x: margin + 14,
      y: cardTop - 18,
      size: 11,
      font: fontBold,
      color: rgb(0.32, 0.35, 0.48),
    });
    const durationText =
      typeof stop.duration === "number" && !Number.isNaN(stop.duration)
        ? `${stop.duration} min`
        : "";
    if (durationText) {
      page.drawText(durationText, {
        x: margin + timelineCardWidth - 90,
        y: cardTop - 18,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
    page.drawText(stop.title || "(未設定)", {
      x: margin + 14,
      y: cardTop - 36,
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.18),
    });
    if (noteLines.length) {
      drawTextBlock(page, noteLines, {
        x: margin + 14,
        yStart: cardTop - 52,
        font,
        size: 11,
        color: rgb(0.3, 0.3, 0.3),
        lineHeight: 15,
      });
    }
    y -= cardHeight + 8;
  });

  if (input.warnings?.length) {
    sectionTitle("Warnings");
    input.warnings.forEach((warning) => {
      const lines = wrapText(warning, font, 11, pageWidth - margin * 2 - 16);
      const blockHeight = lines.length * (11 + DEFAULT_LINE_GAP) + 10;
      if (y - blockHeight < margin) {
        y = addPage();
        sectionTitle("Warnings (続き)");
      }
      const bulletY = y;
      page.drawText("•", {
        x: margin,
        y: bulletY - 2,
        size: 12,
        font: fontBold,
        color: rgb(0.58, 0.32, 0.2),
      });
      drawTextBlock(page, lines, {
        x: margin + 12,
        yStart: bulletY,
        font,
        size: 11,
        color: rgb(0.4, 0.24, 0.1),
        lineHeight: 15,
      });
      y -= blockHeight;
    });
  }

  if (input.references?.length) {
    sectionTitle("References");
    input.references.forEach((ref) => {
      const refText = ref.url ? `${ref.title} (${ref.url})` : ref.title;
      const lines = wrapText(refText, font, 10, pageWidth - margin * 2 - 18);
      const blockHeight = lines.length * (10 + DEFAULT_LINE_GAP) + 10;
      if (y - blockHeight < margin) {
        y = addPage();
        sectionTitle("References (続き)");
      }
      page.drawText("-", {
        x: margin,
        y: y - 2,
        size: 10,
        font: fontBold,
        color: rgb(0.28, 0.33, 0.46),
      });
      drawTextBlock(page, lines, {
        x: margin + 12,
        yStart: y,
        font,
        size: 10,
        color: rgb(0.28, 0.33, 0.46),
        lineHeight: 14,
      });
      y -= blockHeight;
    });
  }

  return pdfDoc.save();
}

type DrawTextOptions = {
  x: number;
  yStart: number;
  font: PDFFont;
  size: number;
  color: ReturnType<typeof rgb>;
  lineHeight?: number;
};

function drawTextBlock(page: PDFPage, lines: string[], options: DrawTextOptions) {
  const { x, yStart, font, size, color, lineHeight = size + DEFAULT_LINE_GAP } = options;
  let cursor = yStart;
  lines.forEach((line) => {
    if (!line.length) {
      cursor -= lineHeight;
      return;
    }
    page.drawText(line, {
      x,
      y: cursor,
      font,
      size,
      color,
    });
    cursor -= lineHeight;
  });
  return cursor;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (!text?.length) return [];
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }
    const hasWhitespace = /\s/.test(paragraph);
    const tokens = hasWhitespace ? paragraph.trim().split(/\s+/) : Array.from(paragraph);
    let currentLine = "";
    tokens.forEach((token) => {
      const candidate = currentLine
        ? hasWhitespace
          ? `${currentLine} ${token}`
          : `${currentLine}${token}`
        : token;
      const width = font.widthOfTextAtSize(candidate, size);
      if (width <= maxWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = token;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    if (paragraphIndex !== paragraphs.length - 1) {
      lines.push("");
    }
  });

  return lines.filter((line, idx, arr) => line.length || idx === 0 || arr[idx - 1].length);
}
