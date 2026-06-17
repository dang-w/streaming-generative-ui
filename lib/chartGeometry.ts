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

  // x ticks: first, last, and (for 3+ points) the midpoint label — kept sparse
  // and deduped so 2-point data doesn't repeat the first label.
  const tickIndices =
    data.length <= 2
      ? data.map((_, i) => i)
      : [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const xTicks = tickIndices.map((i) => ({ x: points[i].x, label: points[i].label }));

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
