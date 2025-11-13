import fs from "node:fs/promises";
import path from "node:path";

const siteTitle = process.argv[2] ?? "voynexus Travel PWA";
const siteDescription =
  process.argv[3] ?? "AI itinerary / multi-lingual articles / facility widget with microCMS.";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f8ea8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="200" fill="#fff" font-size="64" font-family="sans-serif" font-weight="bold">
    ${siteTitle}
  </text>
  <text x="80" y="280" fill="#d1f2ff" font-size="32" font-family="sans-serif">
    ${siteDescription}
  </text>
  <text x="80" y="360" fill="#fff" font-size="24" font-family="sans-serif">
    microCMS • AI Concierge • PWA
  </text>
</svg>`;

async function main() {
  const outputDir = path.join("public", "og");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "default.svg"), svg);
  console.log("OG SVG generated at public/og/default.svg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
