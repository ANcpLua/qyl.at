import { expect, test, type Browser, type Page } from "@playwright/test";
import { routes } from "./routes";

interface PerformanceEvidence {
  cls: number;
  fcp: number;
  inp: number[];
  lcp: number;
  longtasks: Array<{ duration: number; startTime: number }>;
}

interface RunEvidence {
  cls: number;
  inpP75: number;
  interactions: number;
  lcp: number;
  longestTask: number;
  longtaskTotal: number;
}

const SCRIPTED_INTERACTIONS = 22;
const EVENT_TIMING_FLOOR_MS = 16;

function median(values: number[]): number {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
}

function percentile75(values: number[]): number {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * 0.75) - 1)] ?? 0;
}

async function installObservers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const evidence: PerformanceEvidence = { cls: 0, fcp: 0, inp: [], lcp: 0, longtasks: [] };
    Object.assign(window, { __qylPerformance: evidence });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      evidence.lcp = entries.at(-1)?.startTime ?? evidence.lcp;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput: boolean; value: number }>) {
        if (!entry.hadRecentInput) evidence.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) evidence.longtasks.push({ duration: entry.duration, startTime: entry.startTime });
    }).observe({ type: "longtask", buffered: true });
    const interactions = new Map<number, number>();
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number; interactionId: number }>) {
        if (!entry.interactionId) continue;
        interactions.set(entry.interactionId, Math.max(interactions.get(entry.interactionId) ?? 0, entry.duration));
      }
      evidence.inp = [...interactions.values()];
    }).observe({ type: "event", buffered: true, durationThreshold: 0 });
    new PerformanceObserver((list) => {
      const fcp = list.getEntriesByName("first-contentful-paint")[0];
      if (fcp) evidence.fcp = fcp.startTime;
    }).observe({ type: "paint", buffered: true });
  });
}

async function runOnce(browser: Browser, baseURL: string, route: string): Promise<RunEvidence> {
  const context = await browser.newContext({
    baseURL,
    colorScheme: "dark",
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    locale: "en-GB",
    reducedMotion: "reduce",
    screen: { width: 390, height: 844 },
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 170,
    downloadThroughput: 9 * 1024 * 1024 / 8,
    uploadThroughput: 1.5 * 1024 * 1024 / 8,
    connectionType: "cellular4g",
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await installObservers(page);
  try {
    await page.goto(route, { waitUntil: "networkidle" });
    const heading = page.locator("h1");
    for (let index = 0; index < SCRIPTED_INTERACTIONS; index += 1) {
      await heading.click({ position: { x: 8 + index % 3, y: 8 + index % 5 } });
      await page.waitForTimeout(24);
    }
    await page.waitForTimeout(250);
    const values = await page.evaluate(() => ({
      evidence: (window as unknown as { __qylPerformance: PerformanceEvidence }).__qylPerformance,
      interactionCount: (performance as unknown as { interactionCount?: number }).interactionCount ?? 0,
    }));
    const longtasks = values.evidence.longtasks.filter((entry) => entry.startTime >= values.evidence.fcp);
    const interactionDurations = [...values.evidence.inp];
    while (interactionDurations.length < values.interactionCount) interactionDurations.push(EVENT_TIMING_FLOOR_MS);
    return {
      cls: values.evidence.cls,
      inpP75: percentile75(interactionDurations),
      interactions: values.interactionCount,
      lcp: values.evidence.lcp,
      longestTask: Math.max(0, ...longtasks.map((entry) => entry.duration)),
      longtaskTotal: longtasks.reduce((sum, entry) => sum + Math.max(0, entry.duration - 50), 0),
    };
  } finally {
    await context.close();
  }
}

for (const route of routes) {
  test(`${route} clears the fixed 4G / 4x CPU harness`, async ({ browser, baseURL }) => {
    test.setTimeout(180_000);
    const runs: RunEvidence[] = [];
    for (let index = 0; index < 3; index += 1) runs.push(await runOnce(browser, baseURL!, route));
    const evidence = {
      cls: median(runs.map((run) => run.cls)),
      inpP75: median(runs.map((run) => run.inpP75)),
      interactions: median(runs.map((run) => run.interactions)),
      lcp: median(runs.map((run) => run.lcp)),
      longestTask: median(runs.map((run) => run.longestTask)),
      longtaskTotal: median(runs.map((run) => run.longtaskTotal)),
    };
    console.log(`${route} lcp=${evidence.lcp.toFixed(0)}ms longtask_total=${evidence.longtaskTotal.toFixed(0)}ms cls=${evidence.cls.toFixed(3)} inp_p75=${evidence.inpP75.toFixed(0)}ms interactions=${evidence.interactions} longest_task=${evidence.longestTask.toFixed(0)}ms`);
    expect(evidence.lcp).toBeLessThanOrEqual(1_800);
    expect(evidence.longtaskTotal).toBeLessThanOrEqual(150);
    expect(evidence.cls).toBe(0);
    expect(evidence.interactions).toBeGreaterThanOrEqual(20);
    expect(evidence.inpP75).toBeLessThanOrEqual(150);
    expect(evidence.longestTask).toBeLessThanOrEqual(50);
  });
}
