# genUI Phase A — Visual Language + LIVE + Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the working streaming generative-UI demo into the SUBSTRATE "technical-plate" aesthetic and add stream-in motion — turning the default Next.js scaffold into the on-brand π-proof (LIVE mode only; X-RAY and REGISTRY are Phases B/C).

**Architecture:** A presentation + motion layer over the *unchanged* typed-registry engine (`lib/registry.ts`, `lib/schemas.ts`, `lib/tools.ts`, `lib/renderArtifact.tsx`, `lib/model/*`, `lib/frameScheduler.ts`, `hooks/useArtifactStream.ts`). New `components/plate/*` components compose a two-zone "plate"; the four artifact components are restyled in place (same props); `recharts` is replaced by a custom SVG `Chart`; motion is CSS keyed off the hook's `status` + item order. No engine restructure — add, don't change.

**Tech Stack:** Next.js 16 (app router), React 19, Tailwind CSS v4, Zod 4, Vitest + Testing Library, `geist` font package (self-hosted Geist Mono), custom inline SVG for charts.

---

## Source of truth & honesty guardrails (read before starting)

- **Visual targets:** `~/.claude/plans/genui-design-mockup-live.html` (full two-zone layout) and `~/.claude/plans/genui-design-mockup-motion.html` (the animation timing/CSS). These are HTML mockups — translate them into React keyed off the real hook; do **not** copy their hard-coded chart coordinates or fake the stream timing.
- **Governing principle (spec §2):** borrow the grammar, but **every label must be TRUE**. No invented drawing chrome (`DWG NO`, `SCALE NTS`, the `< SUBSTRATE … intora.net` masthead). Codes are real schema names (`chartSchema`). The Readout shows real facts only. No fabricated 60%/53+ metrics anywhere.
- **Real speed by default:** LIVE streams at real speed. Slowed/replayed pacing belongs only to X-RAY (Phase B) — do **not** add artificial delays to LIVE.
- **Phase boundary:** Phase A is **LIVE only**. Do **not** build the `LIVE | X-RAY | REGISTRY` mode switcher (Phase B) or the registry explorer (Phase C). Phase A's layout matches the *motion* mockup (no switcher bar). The `RegistryStrip` is rendered as a legend but its cells are **not** clickable yet (clicking → REGISTRY is Phase C).

---

## File Structure

**Unchanged (the engine — do not edit):**
- `lib/registry.ts`, `lib/schemas.ts`, `lib/renderArtifact.tsx`, `lib/frameScheduler.ts`, `lib/model/adapter.ts`, `lib/model/anthropic.ts`, `app/api/generate/route.ts`, `app/api/dev/smoke/route.ts`

**New files:**
- `app/tokens.css` — *(folded into `globals.css`; see Task 1, no separate file)*
- `components/plate/PlateShell.tsx` — the sheet (cream, dot-grid, double border, padding); renders `children`.
- `components/plate/ZoneTag.tsx` — the `— System · internals —` / `— Output · streamed —` tag.
- `components/plate/Masthead.tsx` — real title + one-line description.
- `components/plate/Readout.tsx` — live parametric panel (MODEL / PATTERN / TRANSPORT / ARTIFACTS / BATCH / STATE).
- `components/plate/RegistryStrip.tsx` — the registry as a horizontal legend (one cell per kind).
- `components/plate/ArtifactBand.tsx` — wraps each artifact with an `arthead` caption + the streaming "active" border.
- `components/artifacts/Chart.tsx` — custom SVG chart primitive (replaces recharts).
- `lib/chartGeometry.ts` — pure value→SVG-coordinate mapping for `Chart` (the testable core).
- `lib/chartGeometry.test.ts` — tests for the geometry helper.
- `lib/bandMeta.ts` — presentation-layer maps: kind→schema-name label and per-item band caption + the `streamingItemId` motion helper.
- `lib/bandMeta.test.ts` — tests for `bandMeta` + `streamingItemId`.
- `components/plate/PlateShell.test.tsx`, `components/plate/Readout.test.tsx`, `components/plate/RegistryStrip.test.tsx`, `components/plate/ArtifactBand.test.tsx`, `components/artifacts/Chart.test.tsx` — component tests.

**Modified files:**
- `package.json` — add `geist`; remove `recharts`.
- `app/globals.css` — replace scaffold with SECTION design tokens + plate chrome + motion CSS.
- `app/layout.tsx` — self-hosted Geist Mono via `geist/font/mono`; paper background.
- `app/page.tsx` — compose `PlateShell` + two zones + the stream of `ArtifactBand`s + motion wiring.
- `components/artifacts/ChartArtifact.tsx` — render the new SVG `Chart` instead of recharts.
- `components/artifacts/MetricArtifact.tsx`, `TableArtifact.tsx`, `TextArtifact.tsx` — in-idiom restyle (same props).
- `components/artifacts/UnknownArtifact.tsx`, `InvalidArtifact.tsx` — redesigned "off-spec" callouts.
- `lib/tools.ts` — longer genuine preamble in `systemPrompt`; export `DEFAULT_MODEL_LABEL` for the Readout.
- `lib/model/stub.ts` — longer genuine `INTRO` paragraph.
- `README.md` — update the "recharts" decision note.

> **Note on testing CSS:** design tokens and the plate chrome live in `globals.css` and are not unit-testable. For those steps, verification is `pnpm build` succeeding + a manual visual diff against the mockup. Every *component* and *pure helper* gets real Vitest/RTL tests.

---

### Task 1: Design tokens + self-hosted Geist Mono

**Files:**
- Modify: `package.json` (add `geist` dependency)
- Modify: `app/globals.css` (replace entire file)
- Modify: `app/layout.tsx` (replace font wiring)

- [ ] **Step 1: Add the self-hosted font package**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && pnpm add geist
```
Expected: `geist` appears under `dependencies` in `package.json`. (The `geist` package bundles Geist Mono `.woff2` files — no network Google-fonts fetch, which fixes the sandbox build noted in spec §3.)

- [ ] **Step 2: Replace `app/globals.css` with the SECTION tokens + plate chrome**

Replace the **entire** contents of `app/globals.css` with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* ===== SECTION design tokens (genUI v2) ===== */
@theme {
  --color-paper: #fff8e7;
  --color-paper-zone: #f5f0e6;
  --color-ink-1: #2a2a2a; /* edges / primary */
  --color-ink-2: #555555; /* secondary, dimension/labels */
  --color-ink-3: #999999; /* construction / sub-labels */
  --color-ink-4: #cccccc; /* ghost grid */
  --color-orange: #ff4f00; /* active / streaming */
  --color-amber: #f0a300; /* metadata / schema refs */
  --color-red: #e03020; /* reserved: section-cut / alert */
}

:root {
  --paper: #fff8e7;
  --paper-zone: #f5f0e6;
  --ink-1: #2a2a2a;
  --ink-2: #555555;
  --ink-3: #999999;
  --ink-4: #cccccc;
  --orange: #ff4f00;
  --amber: #f0a300;
}

body {
  background: #e9e2d0; /* desk behind the sheet */
  color: var(--ink-1);
  font-family: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, Consolas,
    monospace;
  -webkit-font-smoothing: antialiased;
}

/* ===== Plate chrome (awkward in Tailwind; kept as a class) ===== */
.plate-sheet {
  position: relative;
  background: var(--paper);
  background-image: radial-gradient(var(--ink-4) 0.5px, transparent 0.5px);
  background-size: 22px 22px;
  background-position: 18px 18px;
  border: 1.6px solid var(--ink-1);
  padding: 14px;
}
.plate-sheet::after {
  content: "";
  position: absolute;
  inset: 5px;
  border: 0.5px solid var(--ink-3);
  pointer-events: none;
}

/* ===== Stream-in motion (driven by .band / .is-streaming toggles) ===== */
.band {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.band.show {
  opacity: 1;
  transform: none;
}
.band-view.is-streaming {
  box-shadow: 0 0 0 1.5px var(--orange) inset;
}

/* chart line-draw */
.chart-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.chart-line.draw {
  transition: stroke-dashoffset 1.15s ease-out;
  stroke-dashoffset: 0;
}
.chart-point {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.chart-point.draw {
  opacity: 1;
}

/* metric / table stagger-in (delay set inline per index) */
.stagger {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.stagger.in {
  opacity: 1;
  transform: none;
}

/* streaming text cursor */
.stream-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background: var(--orange);
  vertical-align: -2px;
  margin-left: 2px;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
```

- [ ] **Step 3: Rewire `app/layout.tsx` to self-host Geist Mono**

Replace the **entire** contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streaming generative UI",
  description:
    "A typed component registry rendered from a streamed agent response.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
```

(`GeistMono.variable` defines `--font-geist-mono`, which `globals.css` consumes for the body font. The old `Geist`/`Geist_Mono` `next/font/google` imports — the network fetch — are gone.)

- [ ] **Step 4: Verify the build compiles with the new tokens + font**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && pnpm build
```
Expected: build succeeds (no font-fetch error, no missing-module error). It is fine that `page.tsx` still looks like the old scaffold at this point — we replace it in Task 11.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml app/globals.css app/layout.tsx
git commit -m "feat(design): SECTION tokens + self-hosted Geist Mono"
```

---

### Task 2: PlateShell + ZoneTag

**Files:**
- Create: `components/plate/ZoneTag.tsx`
- Create: `components/plate/PlateShell.tsx`
- Test: `components/plate/PlateShell.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/plate/PlateShell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlateShell } from "./PlateShell";
import { ZoneTag } from "./ZoneTag";

describe("PlateShell", () => {
  it("renders the sheet chrome and its children", () => {
    render(
      <PlateShell>
        <p>inner content</p>
      </PlateShell>,
    );
    expect(screen.getByTestId("plate-sheet")).toBeInTheDocument();
    expect(screen.getByText("inner content")).toBeInTheDocument();
  });
});

describe("ZoneTag", () => {
  it("renders its label wrapped in em-dashes", () => {
    render(<ZoneTag label="System · internals" />);
    expect(screen.getByText(/—\s*System · internals\s*—/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- components/plate/PlateShell.test.tsx`
Expected: FAIL — cannot resolve `./PlateShell` / `./ZoneTag`.

- [ ] **Step 3: Implement `ZoneTag`**

Create `components/plate/ZoneTag.tsx`:

```tsx
export function ZoneTag({ label }: { label: string }) {
  return (
    <div className="mb-3.5 text-[8px] uppercase tracking-[0.22em] text-ink-3">
      — {label} —
    </div>
  );
}
```

- [ ] **Step 4: Implement `PlateShell`**

Create `components/plate/PlateShell.tsx`:

```tsx
import type { ReactNode } from "react";

export function PlateShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-[30px]">
      <div className="plate-sheet mx-auto max-w-[1180px]" data-testid="plate-sheet">
        <div className="relative px-[30px] pt-6 pb-7">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- components/plate/PlateShell.test.tsx`
Expected: PASS (both describes).

- [ ] **Step 6: Commit**

```bash
git add components/plate/PlateShell.tsx components/plate/ZoneTag.tsx components/plate/PlateShell.test.tsx
git commit -m "feat(design): PlateShell sheet + ZoneTag"
```

---

### Task 3: Custom SVG chart geometry helper

**Files:**
- Create: `lib/chartGeometry.ts`
- Test: `lib/chartGeometry.test.ts`

This is the pure, testable core of the recharts replacement: map `chartSchema` data to SVG coordinates in a fixed `640×250` viewBox with the mockup's plot box (`left 60, right 600, top 20, bottom 220`).

- [ ] **Step 1: Write the failing test**

Create `lib/chartGeometry.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { chartGeometry, PLOT } from "./chartGeometry";

const data = [
  { label: "Q1", value: 10 },
  { label: "Q2", value: 20 },
  { label: "Q3", value: 40 },
];

describe("chartGeometry", () => {
  it("plots one point per datum", () => {
    expect(chartGeometry(data).points).toHaveLength(3);
  });

  it("spans the plot box horizontally (first at left, last at right)", () => {
    const g = chartGeometry(data);
    expect(g.points[0].x).toBeCloseTo(PLOT.left);
    expect(g.points[g.points.length - 1].x).toBeCloseTo(PLOT.right);
  });

  it("maps larger values to smaller y (higher on screen)", () => {
    const g = chartGeometry(data);
    expect(g.points[2].y).toBeLessThan(g.points[0].y);
  });

  it("keeps all y within the plot box", () => {
    for (const p of chartGeometry(data).points) {
      expect(p.y).toBeGreaterThanOrEqual(PLOT.top);
      expect(p.y).toBeLessThanOrEqual(PLOT.bottom);
    }
  });

  it("flags the last point active and builds a polyline of all points", () => {
    const g = chartGeometry(data);
    expect(g.activeIndex).toBe(2);
    expect(g.polyline.split(" ")).toHaveLength(3);
  });

  it("handles a single datum without dividing by zero", () => {
    const g = chartGeometry([{ label: "only", value: 5 }]);
    expect(g.points[0].x).toBeCloseTo(PLOT.left);
    expect(Number.isFinite(g.points[0].y)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- lib/chartGeometry.test.ts`
Expected: FAIL — cannot resolve `./chartGeometry`.

- [ ] **Step 3: Implement the geometry helper**

Create `lib/chartGeometry.ts`:

```ts
export const VIEWBOX = { width: 640, height: 250 } as const;
export const PLOT = { left: 60, right: 600, top: 20, bottom: 220 } as const;

export type Datum = { label: string; value: number };

export type PlottedPoint = {
  x: number;
  y: number;
  label: string;
  value: number;
};

export type ChartGeometry = {
  points: PlottedPoint[];
  polyline: string; // "x,y x,y ..." for <polyline points=...>
  baselineY: number; // y of value 0 (clamped into the plot box)
  activeIndex: number; // index of the latest/active point
  yTicks: { y: number; value: number }[];
  xTicks: { x: number; label: string }[];
};

/** Map chartSchema data to coordinates in the fixed viewBox. */
export function chartGeometry(data: Datum[]): ChartGeometry {
  const { left, right, top, bottom } = PLOT;
  const max = Math.max(0, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const span = max - min || 1; // avoid /0 when all values equal

  const yFor = (value: number) =>
    bottom - ((value - min) / span) * (bottom - top);
  const xFor = (i: number) =>
    data.length === 1 ? left : left + (i / (data.length - 1)) * (right - left);

  const points: PlottedPoint[] = data.map((d, i) => ({
    x: xFor(i),
    y: yFor(d.value),
    label: d.label,
    value: d.value,
  }));

  const polyline = points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");

  // ~5 evenly spaced y ticks across [min, max].
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = min + (span * i) / 4;
    return { y: yFor(value), value: round(value) };
  });

  // x ticks: first, last, and the midpoint label (keep it sparse + legible).
  const xTicks =
    data.length <= 1
      ? points.map((p) => ({ x: p.x, label: p.label }))
      : [points[0], points[Math.floor((data.length - 1) / 2)], points.at(-1)!].map(
          (p) => ({ x: p.x, label: p.label }),
        );

  return {
    points,
    polyline,
    baselineY: yFor(0),
    activeIndex: points.length - 1,
    yTicks,
    xTicks,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- lib/chartGeometry.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/chartGeometry.ts lib/chartGeometry.test.ts
git commit -m "feat(chart): pure SVG geometry helper (recharts replacement core)"
```

---

### Task 4: Custom SVG `Chart` component

**Files:**
- Create: `components/artifacts/Chart.tsx`
- Test: `components/artifacts/Chart.test.tsx`

Renders the engineering-plot SVG from `chartGeometry`: ghost dashed gridlines, thin ink axes, mono uppercase ticks, a dimension-style rotated y-axis title, an ink line/bars, and the **latest point ringed orange**. The line-draw + point-reveal classes (`chart-line`, `chart-point`) are toggled on mount for motion (Task 12 styles them).

- [ ] **Step 1: Write the failing test**

Create `components/artifacts/Chart.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Chart } from "./Chart";

const data = [
  { label: "Q1", value: 10 },
  { label: "Q2", value: 20 },
  { label: "Q3", value: 40 },
];

describe("Chart", () => {
  it("renders one data point circle per datum (line variant)", () => {
    const { container } = render(<Chart variant="line" data={data} />);
    expect(container.querySelectorAll('[data-role="point"]')).toHaveLength(3);
  });

  it("renders a polyline for the line variant", () => {
    const { container } = render(<Chart variant="line" data={data} />);
    expect(container.querySelector("polyline")).not.toBeNull();
  });

  it("renders one bar per datum for the bar variant", () => {
    const { container } = render(<Chart variant="bar" data={data} />);
    expect(container.querySelectorAll('[data-role="bar"]')).toHaveLength(3);
  });

  it("marks the latest point active (orange ring)", () => {
    const { container } = render(<Chart variant="line" data={data} />);
    expect(container.querySelector('[data-role="active-point"]')).not.toBeNull();
  });

  it("renders the y-axis title when given", () => {
    const { getByText } = render(
      <Chart variant="line" data={data} yLabel="SALES ($K)" />,
    );
    expect(getByText("SALES ($K)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- components/artifacts/Chart.test.tsx`
Expected: FAIL — cannot resolve `./Chart`.

- [ ] **Step 3: Implement `Chart`**

Create `components/artifacts/Chart.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { chartGeometry, PLOT, VIEWBOX, type Datum } from "@/lib/chartGeometry";

export type ChartViewProps = {
  variant: "bar" | "line";
  data: Datum[];
  yLabel?: string;
  /** When true, run the line-draw / reveal animation on mount. */
  animate?: boolean;
};

export function Chart({ variant, data, yLabel, animate = false }: ChartViewProps) {
  const g = chartGeometry(data);
  const [drawn, setDrawn] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const active = g.points[g.activeIndex];

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      role="img"
      aria-label={`${variant} chart`}
      className="block h-auto w-full"
    >
      {/* ghost gridlines */}
      <g stroke="var(--ink-4)" strokeWidth={0.5} strokeDasharray="3 3">
        {g.yTicks.map((t, i) => (
          <line key={i} x1={PLOT.left} y1={t.y} x2={PLOT.right} y2={t.y} />
        ))}
      </g>

      {/* axes */}
      <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke="var(--ink-2)" strokeWidth={0.8} />
      <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="var(--ink-2)" strokeWidth={0.8} />

      {/* y ticks */}
      <g fill="var(--ink-3)" fontSize={8} textAnchor="end" style={{ letterSpacing: "0.06em" }}>
        {g.yTicks.map((t, i) => (
          <text key={i} x={PLOT.left - 8} y={t.y + 3}>
            {t.value}
          </text>
        ))}
      </g>

      {/* x ticks */}
      <g fill="var(--ink-3)" fontSize={8} textAnchor="middle" style={{ textTransform: "uppercase" }}>
        {g.xTicks.map((t, i) => (
          <text key={i} x={t.x} y={PLOT.bottom + 16}>
            {t.label}
          </text>
        ))}
      </g>

      {/* y-axis title (dimension style) */}
      {yLabel && (
        <text
          x={20}
          y={(PLOT.top + PLOT.bottom) / 2}
          transform={`rotate(-90 20 ${(PLOT.top + PLOT.bottom) / 2})`}
          textAnchor="middle"
          fill="var(--ink-2)"
          fontSize={8.5}
          style={{ letterSpacing: "0.1em" }}
        >
          {yLabel}
        </text>
      )}

      {variant === "bar" ? (
        <g>
          {g.points.map((p, i) => {
            const w = 18;
            const isActive = i === g.activeIndex;
            return (
              <rect
                key={i}
                data-role="bar"
                x={p.x - w / 2}
                y={Math.min(p.y, g.baselineY)}
                width={w}
                height={Math.abs(g.baselineY - p.y)}
                fill={isActive ? "var(--orange)" : "var(--ink-1)"}
              />
            );
          })}
        </g>
      ) : (
        <>
          <polyline
            className={`chart-line${drawn ? " draw" : ""}`}
            pathLength={1}
            fill="none"
            stroke="var(--ink-1)"
            strokeWidth={1.6}
            points={g.polyline}
          />
          <g className={`chart-point${drawn ? " draw" : ""}`} fill="var(--ink-1)">
            {g.points.slice(0, -1).map((p, i) => (
              <circle key={i} data-role="point" cx={p.x} cy={p.y} r={2.4} />
            ))}
          </g>
          <g className={`chart-point${drawn ? " draw" : ""}`} data-role="active-point">
            <circle data-role="point" cx={active.x} cy={active.y} r={4.5} fill="none" stroke="var(--orange)" strokeWidth={1.5} />
            <circle cx={active.x} cy={active.y} r={2.2} fill="var(--orange)" />
          </g>
        </>
      )}
    </svg>
  );
}
```

> Note: the bar variant marks the last bar active but renders all points via `data-role="point"` only in the line variant; the test counts `point` roles for line and `bar` roles for bar, so the active-point group's `data-role="point"` circle is included in the line count (3 = 2 plain + 1 active). This matches the test expectation.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- components/artifacts/Chart.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add components/artifacts/Chart.tsx components/artifacts/Chart.test.tsx
git commit -m "feat(chart): custom SVG Chart component"
```

---

### Task 5: Restyle `ChartArtifact` to use `Chart` + drop recharts

**Files:**
- Modify: `components/artifacts/ChartArtifact.tsx` (full rewrite)
- Modify: `package.json` (remove `recharts`)

- [ ] **Step 1: Rewrite `ChartArtifact` to render the SVG `Chart`**

Replace the **entire** contents of `components/artifacts/ChartArtifact.tsx` with:

```tsx
"use client";

import type { z } from "zod";

import { Chart } from "@/components/artifacts/Chart";
import type { chartSchema } from "@/lib/schemas";

export type ChartProps = z.infer<typeof chartSchema> & { animate?: boolean };

export function ChartArtifact({ variant, yLabel, data, animate }: ChartProps) {
  return <Chart variant={variant} data={data} yLabel={yLabel} animate={animate} />;
}
```

(The band caption/`Fig. N` title now lives in `ArtifactBand` — Task 10 — so `ChartArtifact` renders only the plot. `xLabel`/`title` are intentionally dropped from the chrome: the x-axis ticks carry the labels and the band caption carries the title, keeping the plate uncluttered per the mockup.)

- [ ] **Step 2: Remove the recharts dependency**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && pnpm remove recharts
```
Expected: `recharts` removed from `package.json` dependencies.

- [ ] **Step 3: Verify no recharts imports remain**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && grep -rn "recharts" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules
```
Expected: no output (no remaining imports).

- [ ] **Step 4: Run the chart + registry tests**

Run: `pnpm test -- components/artifacts/Chart.test.tsx lib/registry.test.tsx`
Expected: PASS. (`registry.test.tsx` renders a metric, not a chart, so it is unaffected; this confirms the registry still wires `ChartArtifact`.)

- [ ] **Step 5: Commit**

```bash
git add components/artifacts/ChartArtifact.tsx package.json pnpm-lock.yaml
git commit -m "feat(chart): render custom SVG Chart in ChartArtifact, drop recharts"
```

---

### Task 6: Restyle Metric / Table / Text artifacts (in-idiom)

**Files:**
- Modify: `components/artifacts/MetricArtifact.tsx`
- Modify: `components/artifacts/TableArtifact.tsx`
- Modify: `components/artifacts/TextArtifact.tsx`

Same props/interfaces; new presentation. Uppercase mono labels, hairline borders, sentence-case prose for `text`.

- [ ] **Step 1: Restyle `MetricArtifact`**

Replace the **entire** contents of `components/artifacts/MetricArtifact.tsx` with:

```tsx
import type { z } from "zod";

import type { metricSchema } from "@/lib/schemas";

export type MetricProps = z.infer<typeof metricSchema>;

export function MetricArtifact({ label, value, unit, delta, caption }: MetricProps) {
  const arrow = delta === undefined ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const deltaTone =
    delta === undefined || delta === 0
      ? "text-ink-3"
      : delta > 0
        ? "text-[#1f7a3d]"
        : "text-red";

  return (
    <figure className="border-[0.5px] border-ink-3 bg-paper px-[15px] py-3.5">
      <figcaption className="text-[9px] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </figcaption>
      <div className="mt-1.5 flex items-baseline">
        <span className="text-[31px] font-bold leading-none tracking-tight text-ink-1 tabular-nums">
          {value}
          {unit ? <span className="text-base text-ink-3">{unit}</span> : null}
        </span>
        {delta !== undefined ? (
          <span className={`ml-2 text-[11px] ${deltaTone}`}>
            {arrow} {Math.abs(delta)}
          </span>
        ) : null}
      </div>
      {caption ? (
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.04em] text-ink-3">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Restyle `TableArtifact`**

Replace the **entire** contents of `components/artifacts/TableArtifact.tsx` with:

```tsx
import type { z } from "zod";

import type { tableSchema } from "@/lib/schemas";

export type TableProps = z.infer<typeof tableSchema>;

function isNumeric(v: string | number | null) {
  return typeof v === "number";
}

export function TableArtifact({ columns, rows }: TableProps) {
  return (
    <div className="border-[0.5px] border-ink-3 bg-paper px-[18px] pb-3.5 pt-4">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {columns.map((c, j) => (
              <th
                key={c}
                className={`border-b-[0.5px] border-ink-3 px-2.5 py-2 text-[8.5px] uppercase tracking-[0.12em] text-ink-3 ${
                  rows.some((r) => isNumeric(r[j])) ? "text-right" : "text-left"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} data-role="row">
              {columns.map((_, j) => {
                const cell = row[j];
                return (
                  <td
                    key={j}
                    className={`border-b-[0.5px] border-ink-4 px-2.5 py-2 text-ink-1 ${
                      isNumeric(cell) ? "text-right tabular-nums" : "text-left"
                    }`}
                  >
                    {cell === null || cell === undefined ? "—" : String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Restyle `TextArtifact` as a NOTES block (sentence-case prose)**

Replace the **entire** contents of `components/artifacts/TextArtifact.tsx` with:

```tsx
import ReactMarkdown from "react-markdown";
import type { z } from "zod";

import type { textSchema } from "@/lib/schemas";

export type TextProps = z.infer<typeof textSchema>;

export function TextArtifact({ markdown }: TextProps) {
  return (
    <article className="prose prose-sm max-w-[66ch] text-ink-1 prose-headings:text-ink-1 prose-strong:text-ink-1 prose-a:text-orange">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
```

- [ ] **Step 4: Run the artifact tests (content assertions carry over)**

Run: `pnpm test -- components/artifacts/MetricArtifact.test.tsx lib/registry.test.tsx`
Expected: PASS. (`MetricArtifact.test.tsx` asserts text content — label, value, unit, arrows, caption — all preserved by the restyle.)

- [ ] **Step 5: Commit**

```bash
git add components/artifacts/MetricArtifact.tsx components/artifacts/TableArtifact.tsx components/artifacts/TextArtifact.tsx
git commit -m "feat(design): in-idiom restyle of metric, table, text artifacts"
```

---

### Task 7: Redesign fallbacks as "off-spec" callouts

**Files:**
- Modify: `components/artifacts/UnknownArtifact.tsx`
- Modify: `components/artifacts/InvalidArtifact.tsx`
- Test: `components/artifacts/InvalidArtifact.test.tsx` (create)

Surface the "fallbacks, not exceptions" decision honestly: a labelled, intentional "off-spec" callout in the idiom — not a generic red error box. Uses the reserved `--red` for the section-cut marker; shows the real Zod issue.

- [ ] **Step 1: Write the failing test**

Create `components/artifacts/InvalidArtifact.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { InvalidArtifact } from "./InvalidArtifact";

describe("InvalidArtifact", () => {
  it("labels the off-spec kind and lists the real Zod issue", () => {
    const result = z.object({ value: z.number() }).safeParse({ value: "nope" });
    expect(result.success).toBe(false);
    if (result.success) return;

    render(<InvalidArtifact kind="chart" error={result.error} />);
    expect(screen.getByText(/OFF-SPEC/i)).toBeInTheDocument();
    expect(screen.getByText(/chart/)).toBeInTheDocument();
    // the Zod issue path/message is surfaced verbatim
    expect(screen.getByText(/value/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- components/artifacts/InvalidArtifact.test.tsx`
Expected: FAIL — `OFF-SPEC` text not found (current component says "Invalid … artifact").

- [ ] **Step 3: Redesign `InvalidArtifact`**

Replace the **entire** contents of `components/artifacts/InvalidArtifact.tsx` with:

```tsx
import type { ZodError } from "zod";

export function InvalidArtifact({ kind, error }: { kind: string; error: ZodError }) {
  return (
    <aside role="alert" className="border-l-2 border-red bg-paper-zone px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.16em] text-red">
        Off-spec — <span className="text-ink-1">{kind}</span> failed validation
      </p>
      <p className="mt-1 text-[10px] text-ink-2">
        Schema rejected the model&apos;s props; rendered as a fallback, not thrown.
      </p>
      <ul className="mt-2 space-y-0.5 font-mono text-[10px] text-ink-2">
        {error.issues.map((issue, i) => (
          <li key={i}>
            <span className="text-ink-3">{issue.path.join(".") || "(root)"}:</span>{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 4: Redesign `UnknownArtifact`**

Replace the **entire** contents of `components/artifacts/UnknownArtifact.tsx` with:

```tsx
export function UnknownArtifact({ kind }: { kind: string }) {
  return (
    <aside role="status" className="border-l-2 border-amber bg-paper-zone px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.16em] text-amber">
        Off-spec — unknown kind <span className="text-ink-1">{kind}</span>
      </p>
      <p className="mt-1 text-[10px] text-ink-2">
        Not in the registry; no entry resolved. Rendered as a fallback, not thrown.
      </p>
    </aside>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- components/artifacts/InvalidArtifact.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/artifacts/UnknownArtifact.tsx components/artifacts/InvalidArtifact.tsx components/artifacts/InvalidArtifact.test.tsx
git commit -m "feat(design): designed off-spec fallback callouts"
```

---

### Task 8: Readout (live parametric panel)

**Files:**
- Modify: `lib/tools.ts` (export `DEFAULT_MODEL_LABEL`)
- Create: `components/plate/Readout.tsx`
- Test: `components/plate/Readout.test.tsx`

The Readout shows **real** facts only (spec §2): MODEL (the configured model id), PATTERN (amber), TRANSPORT (SSE), ARTIFACTS (live count), BATCH (rAF/frame), STATE (orange while streaming, ink when done).

- [ ] **Step 1: Export the real model label from `lib/tools.ts`**

Add to the end of `lib/tools.ts`:

```ts
// The model id shown in the Readout. Mirrors the anthropic adapter default so
// the panel states a true fact (spec §2). Override via ANTHROPIC_MODEL.
export const DEFAULT_MODEL_LABEL =
  process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
```

- [ ] **Step 2: Write the failing test**

Create `components/plate/Readout.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Readout } from "./Readout";

describe("Readout", () => {
  it("shows the live artifact count and STREAMING state", () => {
    render(<Readout status="streaming" artifactCount={2} />);
    expect(screen.getByTestId("readout-artifacts")).toHaveTextContent("2");
    expect(screen.getByTestId("readout-state")).toHaveTextContent("STREAMING");
  });

  it("flips STATE to DONE when finished", () => {
    render(<Readout status="done" artifactCount={3} />);
    expect(screen.getByTestId("readout-state")).toHaveTextContent("DONE");
  });

  it("shows IDLE before a run", () => {
    render(<Readout status="idle" artifactCount={0} />);
    expect(screen.getByTestId("readout-state")).toHaveTextContent("IDLE");
  });

  it("renders the static real facts (PATTERN, TRANSPORT, BATCH)", () => {
    render(<Readout status="idle" artifactCount={0} />);
    expect(screen.getByText("typed registry")).toBeInTheDocument();
    expect(screen.getByText("SSE")).toBeInTheDocument();
    expect(screen.getByText("rAF / frame")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- components/plate/Readout.test.tsx`
Expected: FAIL — cannot resolve `./Readout`.

- [ ] **Step 4: Implement `Readout`**

Create `components/plate/Readout.tsx`:

```tsx
import type { StreamStatus } from "@/hooks/useArtifactStream";
import { DEFAULT_MODEL_LABEL } from "@/lib/tools";

function Row({
  k,
  children,
  testId,
  tone,
}: {
  k: string;
  children: React.ReactNode;
  testId?: string;
  tone?: "amber" | "active" | "done";
}) {
  const vClass =
    tone === "amber"
      ? "text-amber"
      : tone === "active"
        ? "font-bold text-orange"
        : tone === "done"
          ? "font-bold text-ink-2"
          : "text-ink-1";
  return (
    <div className="flex justify-between">
      <span className="tracking-[0.06em] text-ink-3">{k}</span>
      <span className={vClass} data-testid={testId}>
        {children}
      </span>
    </div>
  );
}

export function Readout({
  status,
  artifactCount,
}: {
  status: StreamStatus;
  artifactCount: number;
}) {
  const stateLabel = status === "streaming" ? "STREAMING" : status.toUpperCase();
  const stateTone =
    status === "streaming" ? "active" : status === "done" ? "done" : undefined;

  return (
    <div className="min-w-[300px] border-[0.5px] border-ink-3 px-3.5 py-2.5 text-[10px] leading-[1.95] text-ink-2">
      <Row k="MODEL">{DEFAULT_MODEL_LABEL}</Row>
      <Row k="PATTERN" tone="amber">
        typed registry
      </Row>
      <Row k="TRANSPORT">SSE</Row>
      <Row k="ARTIFACTS" testId="readout-artifacts">
        {artifactCount}
      </Row>
      <Row k="BATCH">rAF / frame</Row>
      <Row k="STATE" testId="readout-state" tone={stateTone}>
        {stateLabel}
      </Row>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- components/plate/Readout.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/tools.ts components/plate/Readout.tsx components/plate/Readout.test.tsx
git commit -m "feat(design): live Readout parametric panel"
```

---

### Task 9: RegistryStrip (the registry as a legend)

**Files:**
- Create: `components/plate/RegistryStrip.tsx`
- Test: `components/plate/RegistryStrip.test.tsx`

Derived from the real `registry` object — one cell per kind with a hatch swatch, the `KIND`, and the amber `schema` ref. Not clickable in Phase A (clicking → REGISTRY is Phase C).

- [ ] **Step 1: Write the failing test**

Create `components/plate/RegistryStrip.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegistryStrip } from "./RegistryStrip";

describe("RegistryStrip", () => {
  it("renders a cell for every registry kind", () => {
    render(<RegistryStrip />);
    for (const kind of ["CHART", "TABLE", "METRIC", "TEXT"]) {
      expect(screen.getByText(kind)).toBeInTheDocument();
    }
  });

  it("labels each cell with its schema name", () => {
    render(<RegistryStrip />);
    expect(screen.getByText("chartSchema")).toBeInTheDocument();
    expect(screen.getByText("textSchema")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- components/plate/RegistryStrip.test.tsx`
Expected: FAIL — cannot resolve `./RegistryStrip` (and `SCHEMA_NAME` from Task created next).

- [ ] **Step 3: Create the kind→schema-name map in `lib/bandMeta.ts`**

Create `lib/bandMeta.ts` (the rest of this module — captions + `streamingItemId` — is added in Task 10; create the file now with the map so `RegistryStrip` can import it):

```ts
import type { ArtifactKind } from "@/lib/registry";

/** The real Zod export name for each kind — the x-ray cross-reference anchor. */
export const SCHEMA_NAME: Record<ArtifactKind, string> = {
  chart: "chartSchema",
  table: "tableSchema",
  metric: "metricSchema",
  text: "textSchema",
};
```

- [ ] **Step 4: Implement `RegistryStrip`**

Create `components/plate/RegistryStrip.tsx`:

```tsx
import { SCHEMA_NAME } from "@/lib/bandMeta";
import { registry, type ArtifactKind } from "@/lib/registry";

const HATCH: Record<ArtifactKind, string> = {
  chart:
    "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 3px),repeating-linear-gradient(-45deg,#555 0 0.6px,transparent 0.6px 3px)",
  metric: "repeating-linear-gradient(0deg,#555 0 0.6px,transparent 0.6px 4px)",
  table: "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 8px)",
  text: "repeating-linear-gradient(45deg,#999 0 0.6px,transparent 0.6px 5px,#999 5px 5.6px,transparent 5.6px 8px)",
};

export function RegistryStrip() {
  const kinds = Object.keys(registry) as ArtifactKind[];
  return (
    <div className="mt-5 border-[0.5px] border-ink-3 px-4 py-3">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-2">
          Artifact Schedule · the registry
        </span>
        <span className="text-[9px] tracking-[0.03em] text-ink-3">
          // one entry per kind — tool, validation &amp; render all derive from it
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-2 md:grid-cols-4">
        {kinds.map((kind) => (
          <div key={kind} className="flex items-center gap-2.5 text-[10.5px]">
            <span
              className="h-[13px] w-[22px] flex-none border-[0.5px] border-ink-2"
              style={{ background: HATCH[kind] }}
            />
            <span className="text-ink-1">{kind.toUpperCase()}</span>
            <span className="ml-auto tracking-[0.03em] text-amber">
              {SCHEMA_NAME[kind]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- components/plate/RegistryStrip.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/bandMeta.ts components/plate/RegistryStrip.tsx components/plate/RegistryStrip.test.tsx
git commit -m "feat(design): RegistryStrip legend derived from the registry"
```

---

### Task 10: ArtifactBand + caption/schema-ref + streaming logic

**Files:**
- Modify: `lib/bandMeta.ts` (add `bandCaption` + `streamingItemId`)
- Test: `lib/bandMeta.test.ts` (create)
- Create: `components/plate/ArtifactBand.tsx`
- Test: `components/plate/ArtifactBand.test.tsx`

`ArtifactBand` wraps each rendered item with a consistent `arthead` (caption left; `kind · schema` ref right, kind in amber) and applies the orange "active" border while that band is the streaming one. `streamingItemId` is the pure motion helper (spec §12): the last item is streaming iff `status === "streaming"`.

- [ ] **Step 1: Write the failing test for the helpers**

Create `lib/bandMeta.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { bandCaption, streamingItemId } from "./bandMeta";
import type { TimelineItem } from "@/hooks/useArtifactStream";

const text: TimelineItem = { id: "t1", type: "text", text: "hi" };
const chart: TimelineItem = {
  id: "c1",
  type: "artifact",
  kind: "chart",
  props: { title: "Monthly Sales" },
};
const metric: TimelineItem = {
  id: "m1",
  type: "artifact",
  kind: "metric",
  props: {},
};

describe("streamingItemId", () => {
  it("returns the last item id while streaming", () => {
    expect(streamingItemId([text, chart], "streaming")).toBe("c1");
  });
  it("returns null when not streaming", () => {
    expect(streamingItemId([text, chart], "done")).toBeNull();
  });
  it("returns null for an empty timeline", () => {
    expect(streamingItemId([], "streaming")).toBeNull();
  });
});

describe("bandCaption", () => {
  it("labels a text item Notes", () => {
    expect(bandCaption(text)).toBe("Notes");
  });
  it("uses the chart title when present", () => {
    expect(bandCaption(chart)).toBe("Monthly Sales");
  });
  it("falls back to a kind label when no title", () => {
    expect(bandCaption(metric)).toBe("Headline Metric");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- lib/bandMeta.test.ts`
Expected: FAIL — `bandCaption` / `streamingItemId` not exported.

- [ ] **Step 3: Add the helpers to `lib/bandMeta.ts`**

Append to `lib/bandMeta.ts`:

```ts
import type { StreamStatus, TimelineItem } from "@/hooks/useArtifactStream";

/** Which timeline item is currently streaming (the last one, while live). */
export function streamingItemId(
  items: TimelineItem[],
  status: StreamStatus,
): string | null {
  if (status !== "streaming" || items.length === 0) return null;
  return items[items.length - 1].id;
}

const KIND_FALLBACK: Record<string, string> = {
  chart: "Chart",
  table: "Table",
  metric: "Headline Metric",
  text: "Notes",
};

/** The band caption: the artifact's own title if it has one, else a kind label. */
export function bandCaption(item: TimelineItem): string {
  if (item.type === "text") return "Notes";
  const props = item.props as { title?: unknown };
  if (typeof props?.title === "string" && props.title.trim()) return props.title;
  return KIND_FALLBACK[item.kind] ?? item.kind;
}
```

(Add the `import type` line at the top alongside the existing `ArtifactKind` import.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- lib/bandMeta.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Write the failing test for `ArtifactBand`**

Create `components/plate/ArtifactBand.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArtifactBand } from "./ArtifactBand";

describe("ArtifactBand", () => {
  it("renders the caption and the kind · schema ref", () => {
    render(
      <ArtifactBand caption="Monthly Sales" kind="chart" streaming={false}>
        <svg />
      </ArtifactBand>,
    );
    expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
    expect(screen.getByText("chart")).toBeInTheDocument();
    expect(screen.getByText("chartSchema")).toBeInTheDocument();
  });

  it("marks the view as streaming when active", () => {
    render(
      <ArtifactBand caption="X" kind="metric" streaming>
        <div />
      </ArtifactBand>,
    );
    expect(screen.getByTestId("band-view")).toHaveClass("is-streaming");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm test -- components/plate/ArtifactBand.test.tsx`
Expected: FAIL — cannot resolve `./ArtifactBand`.

- [ ] **Step 7: Implement `ArtifactBand`**

Create `components/plate/ArtifactBand.tsx`:

```tsx
import type { ReactNode } from "react";

import { SCHEMA_NAME } from "@/lib/bandMeta";
import type { ArtifactKind } from "@/lib/registry";

export function ArtifactBand({
  caption,
  kind,
  streaming,
  shown = true,
  children,
}: {
  caption: string;
  kind: ArtifactKind | "text";
  streaming: boolean;
  shown?: boolean;
  children: ReactNode;
}) {
  const schema = SCHEMA_NAME[kind as ArtifactKind] ?? `${kind}Schema`;
  return (
    <div className={`band mb-6${shown ? " show" : ""}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-2">
          {caption}
        </span>
        <span className="text-[8.5px] uppercase tracking-[0.06em] text-ink-3">
          <b className="font-bold text-amber">{kind}</b> · {schema}
        </span>
      </div>
      <div
        data-testid="band-view"
        className={`band-view${streaming ? " is-streaming" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm test -- components/plate/ArtifactBand.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add lib/bandMeta.ts lib/bandMeta.test.ts components/plate/ArtifactBand.tsx components/plate/ArtifactBand.test.tsx
git commit -m "feat(design): ArtifactBand caption/ref + streaming-band helpers"
```

---

### Task 11: Masthead + compose the LIVE page

**Files:**
- Create: `components/plate/Masthead.tsx`
- Modify: `app/page.tsx` (full rewrite)

Compose the plate: Zone 1 (Masthead + Readout + RegistryStrip) over the heavy divider; Zone 2 (Prompt + the stream of `ArtifactBand`s). Wire the Readout to the hook's `status` + artifact count, and pass each band its `streaming` flag from `streamingItemId`.

- [ ] **Step 1: Implement `Masthead`**

Create `components/plate/Masthead.tsx`:

```tsx
export function Masthead({
  onReset,
  showReset,
}: {
  onReset: () => void;
  showReset: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-[30px]">
      <div>
        <h1 className="m-0 text-[22px] font-bold tracking-[0.02em] text-ink-1">
          Streaming generative UI
        </h1>
        <p className="mt-2 max-w-[42ch] text-[11px] leading-relaxed text-ink-2">
          A typed component registry rendered from a streamed agent response.
        </p>
      </div>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-[9px] uppercase tracking-[0.1em] text-ink-3 hover:text-orange"
        >
          ⟲ Clear
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/page.tsx` to compose the plate**

Replace the **entire** contents of `app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";

import { ArtifactBand } from "@/components/plate/ArtifactBand";
import { Masthead } from "@/components/plate/Masthead";
import { PlateShell } from "@/components/plate/PlateShell";
import { Readout } from "@/components/plate/Readout";
import { RegistryStrip } from "@/components/plate/RegistryStrip";
import { ZoneTag } from "@/components/plate/ZoneTag";
import { useArtifactStream } from "@/hooks/useArtifactStream";
import { bandCaption, streamingItemId } from "@/lib/bandMeta";
import { renderArtifact } from "@/lib/renderArtifact";

const EXAMPLE_PROMPT =
  "Show me a quarterly performance snapshot: a sales trend chart, a few headline metrics, and a table of top accounts.";

export default function Home() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const { items, status, error, send, reset } = useArtifactStream();

  const artifactCount = items.filter((it) => it.type === "artifact").length;
  const activeId = streamingItemId(items, status);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || status === "streaming") return;
    send(trimmed);
  };

  return (
    <PlateShell>
      {/* ===== ZONE 1 — INSTRUMENT ===== */}
      <div className="mb-1 border-b-[1.4px] border-ink-1 pb-[22px]">
        <ZoneTag label="System · internals" />
        <div className="flex items-start justify-between gap-[30px]">
          <Masthead onReset={reset} showReset={items.length > 0} />
          <Readout status={status} artifactCount={artifactCount} />
        </div>
        <RegistryStrip />
      </div>

      {/* ===== ZONE 2 — STREAM ===== */}
      <div className="pt-[22px]">
        <ZoneTag label="Output · streamed" />
        <form className="mb-6" onSubmit={onSubmit}>
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-3">
            Prompt
          </div>
          <div className="mt-2 flex items-stretch gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              disabled={status === "streaming"}
              className="flex-1 resize-none border-[0.8px] border-ink-2 bg-paper-zone px-3.5 py-3 text-xs text-ink-1 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || status === "streaming"}
              className="border border-ink-1 bg-paper px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-1 disabled:opacity-40"
            >
              ▶ Generate
            </button>
          </div>
        </form>

        {error && (
          <aside
            role="alert"
            className="mb-6 border-l-2 border-red bg-paper-zone px-4 py-3 text-[10px] text-ink-2"
          >
            <span className="text-[9px] uppercase tracking-[0.16em] text-red">
              Stream error —{" "}
            </span>
            {error}
          </aside>
        )}

        {items.map((item) => (
          <ArtifactBand
            key={item.id}
            caption={bandCaption(item)}
            kind={item.type === "text" ? "text" : item.kind}
            streaming={item.id === activeId}
          >
            {item.type === "text" ? (
              <article className="prose prose-sm max-w-[66ch] text-ink-1">
                {item.text}
                {item.id === activeId && <span className="stream-cursor" />}
              </article>
            ) : (
              renderArtifact(item.kind, {
                ...(item.props as Record<string, unknown>),
                animate: item.id === activeId,
              })
            )}
          </ArtifactBand>
        ))}
      </div>
    </PlateShell>
  );
}
```

> Note: text items render the raw streamed string with a live orange cursor while active (mockup's typing feel); the `TextArtifact` markdown component is used by `renderArtifact` for `text` *artifacts* emitted as tool-calls, while the leading narration is a streamed text *run*. Both paths are exercised. `animate` is spread into chart props so only the actively-streaming chart runs its line-draw.

- [ ] **Step 3: Run the full test suite**

Run: `pnpm test`
Expected: PASS (all suites green).

- [ ] **Step 4: Build to confirm the page compiles**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 5: Manual visual check (deterministic stub)**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && MODEL_ADAPTER=stub pnpm dev
```
Open `http://localhost:3000`, click **▶ Generate**, and confirm against `genui-design-mockup-live.html`: cream sheet + dot-grid + double border; two zones with a heavy divider; Readout STATE flips STREAMING→DONE and ARTIFACTS counts up; bands appear with captions + amber `kind · schema` refs; the chart renders as an ink line with the latest point ringed orange. Stop the server when done.

- [ ] **Step 6: Commit**

```bash
git add components/plate/Masthead.tsx app/page.tsx
git commit -m "feat(design): compose the LIVE plate (two zones + stream)"
```

---

### Task 12: Stream-in motion (per-artifact entrances)

**Files:**
- Modify: `components/artifacts/MetricArtifact.tsx` (stagger-in)
- Modify: `components/artifacts/TableArtifact.tsx` (row stagger-in)
- (Chart line-draw + band show/active already wired via Tasks 4/10/11 + the CSS in Task 1.)

The band `show` transition, the chart line-draw (`animate` prop → `.draw`), the active-border (`is-streaming`), and the streaming text cursor are already in place. This task adds the metric-card and table-row stagger using the `.stagger` CSS from Task 1, triggered on mount.

- [ ] **Step 1: Add mount-triggered stagger to `MetricArtifact`**

In `components/artifacts/MetricArtifact.tsx`, make the file a client component with a mount toggle. Replace the **entire** file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { z } from "zod";

import type { metricSchema } from "@/lib/schemas";

export type MetricProps = z.infer<typeof metricSchema>;

export function MetricArtifact({ label, value, unit, delta, caption }: MetricProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const arrow = delta === undefined ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const deltaTone =
    delta === undefined || delta === 0
      ? "text-ink-3"
      : delta > 0
        ? "text-[#1f7a3d]"
        : "text-red";

  return (
    <figure className={`stagger${shown ? " in" : ""} border-[0.5px] border-ink-3 bg-paper px-[15px] py-3.5`}>
      <figcaption className="text-[9px] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </figcaption>
      <div className="mt-1.5 flex items-baseline">
        <span className="text-[31px] font-bold leading-none tracking-tight text-ink-1 tabular-nums">
          {value}
          {unit ? <span className="text-base text-ink-3">{unit}</span> : null}
        </span>
        {delta !== undefined ? (
          <span className={`ml-2 text-[11px] ${deltaTone}`}>
            {arrow} {Math.abs(delta)}
          </span>
        ) : null}
      </div>
      {caption ? (
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.04em] text-ink-3">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Add row stagger to `TableArtifact`**

In `components/artifacts/TableArtifact.tsx`, make it a client component and stagger the rows. Replace the **entire** file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { z } from "zod";

import type { tableSchema } from "@/lib/schemas";

export type TableProps = z.infer<typeof tableSchema>;

function isNumeric(v: string | number | null) {
  return typeof v === "number";
}

export function TableArtifact({ columns, rows }: TableProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="border-[0.5px] border-ink-3 bg-paper px-[18px] pb-3.5 pt-4">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {columns.map((c, j) => (
              <th
                key={c}
                className={`border-b-[0.5px] border-ink-3 px-2.5 py-2 text-[8.5px] uppercase tracking-[0.12em] text-ink-3 ${
                  rows.some((r) => isNumeric(r[j])) ? "text-right" : "text-left"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              data-role="row"
              className={`stagger${shown ? " in" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {columns.map((_, j) => {
                const cell = row[j];
                return (
                  <td
                    key={j}
                    className={`border-b-[0.5px] border-ink-4 px-2.5 py-2 text-ink-1 ${
                      isNumeric(cell) ? "text-right tabular-nums" : "text-left"
                    }`}
                  >
                    {cell === null || cell === undefined ? "—" : String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

> `<tr>` accepts `style`/`className` fine; the `.stagger` opacity transition on a table row is well-supported. Per-row `transitionDelay` produces the cascade.

- [ ] **Step 3: Re-run the artifact tests**

Run: `pnpm test -- components/artifacts/MetricArtifact.test.tsx`
Expected: PASS. (Content assertions unaffected by the wrapper class. Note: in jsdom `requestAnimationFrame` runs; the `in` class is additive and does not hide content from queries.)

- [ ] **Step 4: Manual motion check (deterministic stub)**

Run `MODEL_ADAPTER=stub pnpm dev`, open the app, click **▶ Generate**, and confirm against `genui-design-mockup-motion.html`: bands fade/slide in band-by-band; the chart line draws then points + the orange active point appear; metric cards and table rows stagger in; the active orange inset border travels down the plate; the Readout narrates live. Confirm there are **no artificial delays** beyond the stub's own pacing (LIVE = real speed). Stop the server when done.

- [ ] **Step 5: Commit**

```bash
git add components/artifacts/MetricArtifact.tsx components/artifacts/TableArtifact.tsx
git commit -m "feat(motion): stagger-in for metric cards and table rows"
```

---

### Task 13: Longer genuine preamble

**Files:**
- Modify: `lib/model/stub.ts` (lengthen `INTRO`)
- Modify: `lib/tools.ts` (system-prompt narration instruction)
- Test: `lib/model/stub.test.ts` (create)

The one-sentence narration is too short to perceive streaming smoothness (spec §10). Lengthen to a short *genuine* paragraph in both the live system prompt and the deterministic stub.

- [ ] **Step 1: Write the failing test**

Create `lib/model/stub.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { STUB_INTRO } from "./stub";

describe("stub INTRO", () => {
  it("is a genuine multi-sentence paragraph", () => {
    expect(STUB_INTRO.length).toBeGreaterThan(180);
    const sentences = STUB_INTRO.split(/(?<=[.!?])\s+/).filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(2);
  });

  it("frames the actual output (chart, metrics, table)", () => {
    expect(STUB_INTRO.toLowerCase()).toContain("chart");
    expect(STUB_INTRO.toLowerCase()).toContain("metric");
    expect(STUB_INTRO.toLowerCase()).toContain("account");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- lib/model/stub.test.ts`
Expected: FAIL — `STUB_INTRO` not exported (it is the private `INTRO`).

- [ ] **Step 3: Lengthen + export `INTRO` in `lib/model/stub.ts`**

In `lib/model/stub.ts`, replace the `const INTRO = …;` declaration with an exported, longer paragraph and update the one reference in `stream()`:

```ts
export const STUB_INTRO =
  "Here's a quarterly performance snapshot built from your request. I'll start with the monthly sales trend so the shape of the year is clear, then surface the headline metrics that summarise it, and finish with the table of top accounts by ARR. Each block below is a separate typed artifact, streamed and rendered as it arrives.";
```

Then in the `stream()` method, change `const words = INTRO.split(" ");` to:

```ts
    const words = STUB_INTRO.split(" ");
```

(Remove the old private `INTRO` constant entirely.)

- [ ] **Step 4: Lengthen the live narration instruction in `lib/tools.ts`**

In `lib/tools.ts`, replace the second bullet of the `systemPrompt` array (the `"Always begin your response with one long plain-text sentence…"` line) with:

```ts
  "Begin your response with a short plain-text paragraph (two to four sentences) that genuinely frames what you're about to render — name the artifacts and what they show, in order. Write this as ordinary text, not as a tool call. Keep it real: describe the actual output, do not pad.",
```

- [ ] **Step 5: Run the tests**

Run: `pnpm test -- lib/model/stub.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/model/stub.ts lib/tools.ts lib/model/stub.test.ts
git commit -m "feat(content): longer genuine streaming preamble (stub + system prompt)"
```

---

### Task 14: README recharts note + final verification

**Files:**
- Modify: `README.md` (update the recharts decision)

- [ ] **Step 1: Update the recharts decision in `README.md`**

Run to locate the note:
```bash
cd /Users/dan/code/streaming-generative-ui && grep -n -i "recharts" README.md
```
Edit that section so it records the v2 decision: recharts was replaced by a custom inline SVG `Chart` (`components/artifacts/Chart.tsx` + `lib/chartGeometry.ts`) to get the engineering-plot aesthetic and the line-draw motion, and to drop a heavy dependency. The custom component consumes the same `chartSchema` props. If no recharts mention exists, add a short "Charts" subsection stating the same.

- [ ] **Step 2: Full verification — tests, lint, build**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && pnpm test && pnpm lint && pnpm build
```
Expected: all green — every test passes, no lint errors, build succeeds.

- [ ] **Step 3: Confirm no stray scaffold / dark-mode / recharts remains**

Run:
```bash
cd /Users/dan/code/streaming-generative-ui && grep -rn "recharts\|dark:\|prefers-color-scheme\|#ffffff\|bg-white\|text-zinc" --include="*.ts" --include="*.tsx" --include="*.css" . --exclude-dir=node_modules
```
Expected: no output. (SECTION is cream-only by rule — spec §14.6; the scaffold dark classes and white backgrounds should all be gone.)

- [ ] **Step 4: Final manual pass (both adapters if a key is set)**

Run `MODEL_ADAPTER=stub pnpm dev` and walk LIVE end-to-end against both mockups one last time. If `ANTHROPIC_API_KEY` is set, also run `pnpm dev` (live adapter) and confirm a real prompt streams with the longer preamble and renders in-idiom.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: record custom SVG chart decision (recharts removed)"
```

---

## Self-Review (completed against the spec)

**Spec coverage (§§1–13):**
- §3 visual tokens + self-hosted Geist Mono → Task 1.
- §4 PlateShell + two-zone structure + ZoneTag → Tasks 2, 11.
- §5.1 Masthead / Readout / RegistryStrip → Tasks 9, 8, 11.
- §5.2 Prompt + ArtifactBand (caption + `kind · schema` ref) → Tasks 10, 11.
- §5.3 in-idiom artifacts incl. custom SVG chart; designed fallbacks → Tasks 3, 4, 5, 6, 7.
- §5.4 / §12 stream-in motion (active border travel, line-draw, stagger, live Readout) → Tasks 1 (CSS), 4, 10, 11, 12.
- §10 longer preamble (both system prompt + stub) → Task 13.
- §9 hook usage: uses existing `status` + derives count/order; **no engine change** (the X-RAY run-log retention in §9 is deferred to Phase B, correctly out of scope here).
- §13 honesty guardrails → enforced in Tasks 8 (real facts), 4/10 (real schema names), 12/Task 11 step 5 (real speed), 14 step 3 (no fabricated metrics / cream-only).
- §11 phase boundary: mode switcher (B) and registry explorer (C) explicitly excluded; RegistryStrip rendered non-clickable.

**Open decisions (§14) resolved for Phase A:** (1) recharts → custom SVG chart: **yes** (Tasks 3–5). (6) dark variant: **out** (Task 14 step 3 guards it). Decisions 2/3/5 belong to Phases B/C; decision 4 (pattern name) is a separate naming task, not blocking Phase A.

**Placeholder scan:** every code step contains full file contents or exact edits; commands have expected output. No TBD/TODO.

**Type consistency:** `streamingItemId`, `bandCaption`, `SCHEMA_NAME` (lib/bandMeta.ts) used consistently across Tasks 9–11; `Chart`/`chartGeometry`/`PLOT`/`VIEWBOX` consistent across Tasks 3–5; `Readout` props `{status, artifactCount}` match the call site in Task 11; `ArtifactBand` props `{caption, kind, streaming, shown?, children}` match the call site.
