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

  it("does not duplicate the first label for two-point data", () => {
    const g = chartGeometry([
      { label: "A", value: 1 },
      { label: "B", value: 2 },
    ]);
    expect(g.xTicks.map((t) => t.label)).toEqual(["A", "B"]);
  });

  it("handles all-equal values without dividing by zero (span guard)", () => {
    const g = chartGeometry([
      { label: "A", value: 7 },
      { label: "B", value: 7 },
      { label: "C", value: 7 },
    ]);
    for (const p of g.points) {
      expect(Number.isFinite(p.y)).toBe(true);
      expect(p.y).toBeLessThanOrEqual(PLOT.bottom);
      expect(p.y).toBeGreaterThanOrEqual(PLOT.top);
    }
  });
});
