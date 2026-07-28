import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Browser specs only. The default pattern also matches tests/vitals.test.ts,
  // which is a node:test file: Playwright contributes none of its tests but
  // still imports it in every worker, so the whole worker suite -- HTTP servers,
  // OTLP exporters, their timers -- executed alongside the browser work and
  // competed with it. `npm run test:unit` owns that file and runs it separately.
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [["line"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    colorScheme: "dark",
    locale: "en-GB",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npx wrangler dev --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
