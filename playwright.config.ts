import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60 * 1000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 14"] }
    }
  ],
  webServer: {
    command: "pnpm exec next dev --port 3000 --hostname localhost",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !!process.env.PLAYWRIGHT_BASE_URL,
    timeout: 120 * 1000
  }
});
