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
