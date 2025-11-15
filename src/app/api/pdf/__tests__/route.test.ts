import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/pdf/route";

const buildRequest = (body: unknown) =>
  new Request("http://localhost/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("/api/pdf route", () => {
  it("accepts warnings provided as a string", async () => {
    const response = await POST(
      buildRequest({
        title: "Test itinerary",
        timeline: [{ time: "09:00", title: "Start" }],
        warnings: "Bring an umbrella",
      })
    );

    expect(response.status).toBe(200);
    const buffer = Buffer.from(await response.arrayBuffer());
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("renders multi-byte characters without failing", async () => {
    const response = await POST(
      buildRequest({
        title: "徳島の旅程",
        summary: "交通: バス",
        details: { area: "阿波エリア", pace: "バランス / 標準" },
        timeline: [{ time: "09:00", title: "集合・出発", note: "徳島駅" }],
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/pdf");
    const buffer = Buffer.from(await response.arrayBuffer());
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
