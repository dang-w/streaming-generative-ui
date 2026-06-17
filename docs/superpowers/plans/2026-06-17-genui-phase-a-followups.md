# genUI Phase A — Post-ship follow-ups

> Captured from Dan's visual review of the shipped Phase A LIVE view (2026-06-17). Phase A is
> complete + committed on `feat/genui-phase-a-design-pass`; these are polish items for a
> follow-up pass (call it Phase A.1), not blockers.

## 1. Metric cards render full-width stacked — should sit inline as a row

**Observed:** When the model emits several `metric` artifacts, each becomes its own full-width
`ArtifactBand`, so the stat cards stack vertically and stretch the whole container. The original
LIVE mockup grouped the headline metrics into a **single band with a 3-up grid** (`repeat(3, 1fr)`).

**Why it happens:** `metricSchema` is one metric per artifact, and the model emits one tool-call
per metric → N separate bands. Nothing groups consecutive metric bands.

**Options (decide at build):**
- (a) **Group consecutive same-kind artifacts** (esp. `metric`) into one band rendered as a
  responsive row/grid. Most faithful to the mockup; needs a grouping pass over `items` in
  `app/page.tsx` before mapping to bands, and an ArtifactBand variant that lays children in a grid.
- (b) Make `MetricArtifact` itself `inline-flex`/auto-width and have the band lay multiple metrics
  in a flex row. Simpler but only helps if metrics share a band (still needs grouping).
- (c) Leave one-metric-per-band but cap card width + left-align so they don't stretch full width.
  Cheapest; least like the mockup.

Lean: (a) — group runs of consecutive `metric` items into a single grid band. Keep it honest:
the grouping is presentation-only; each card is still one validated artifact.

## 2. NOTES (text artifact) only fills ~50% of the container width

**Observed:** The `text`/NOTES block looks narrow (~50%) against the full plate width.

**Why:** `TextArtifact` uses `max-w-[66ch]` for prose readability. On the wide plate that reads as
under-filled.

**Options:** widen the cap (e.g. `max-w-[80ch]` or `max-w-none` within the band), or keep 66ch but
visually anchor it (e.g. a subtle rule/than the band edge) so it reads intentional rather than
truncated. Lean: bump to ~`78–84ch` — preserves readability, fills the band better. Confirm
against the mockup's `max-width: 66ch` on `.notes p` (mockup used 66ch but a narrower sheet).

## 3. Auto smooth-scroll to keep the actively-streaming band in view

**Observed:** Bands render with the correct orange active border as they stream in, but the page
doesn't follow — later artifacts appear below the fold.

**Want:** as each new band becomes the streaming/active one, smooth-scroll so it sits roughly in
the vertical centre of the viewport.

**Approach:** in `app/page.tsx`, when `activeId` changes, `scrollIntoView({ behavior: "smooth",
block: "center" })` on the active band's element (ref keyed by id, or `document.getElementById`).
Guard for `prefers-reduced-motion` (respect it — honesty/accessibility) and only scroll while
`status === "streaming"` so it doesn't yank the page after completion. Keep it real-speed; no
artificial pauses.

---

### Not raised but worth a glance during A.1
- README still says "three artifact kinds (chart, table, text)" and lists the demo model as
  `claude-sonnet-4-6` / `@anthropic-ai/sdk` — both stale (there are four kinds incl. `metric`, and
  the model now routes through Vercel AI SDK Core). Out of scope for Phase A's recharts edit, but
  cheap to correct in a docs pass.
