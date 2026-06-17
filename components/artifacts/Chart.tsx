"use client";

import { useEffect, useState } from "react";

import { chartGeometry, PLOT, VIEWBOX, type Datum } from "@/lib/chartGeometry";

export type ChartViewProps = {
  variant: "bar" | "line";
  data: Datum[];
  yLabel?: string;
  /**
   * Run the line-draw / reveal animation on mount. Defaults to true: in the LIVE
   * stream each band mounts exactly once when its artifact arrives, so mount ===
   * stream-in. (renderArtifact strips unknown props via Zod, so this can't be
   * passed through it — it's a mount-time default, disabled explicitly in tests.)
   */
  animate?: boolean;
};

export function Chart({ variant, data, yLabel, animate = true }: ChartViewProps) {
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
