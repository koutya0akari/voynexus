import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "@/lib/sanitize";

describe("sanitizeRichText", () => {
  it("removes scripts", () => {
    const dirty = `<p>安全</p><script>alert('xss')</script>`;
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain("script");
  });

  it("keeps allowed tags", () => {
    const dirty = `<p><strong>Hello</strong> <em>world</em></p>`;
    const clean = sanitizeRichText(dirty);
    expect(clean).toContain("<strong>");
  });
});
