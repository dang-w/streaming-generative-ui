import type { z } from "zod";

import type { metricSchema } from "@/lib/schemas";

export type MetricProps = z.infer<typeof metricSchema>;

export function MetricArtifact({ label, value, unit, delta, caption }: MetricProps) {
  const tone =
    delta === undefined || delta === 0
      ? "text-zinc-500"
      : delta > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";
  const arrow = delta === undefined ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "—";

  return (
    <figure className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <figcaption className="text-sm text-zinc-500">{label}</figcaption>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
          {unit ? <span className="ml-0.5 text-xl text-zinc-400">{unit}</span> : null}
        </span>
        {delta !== undefined ? (
          <span className={`text-sm font-medium ${tone}`}>
            {arrow} {Math.abs(delta)}
          </span>
        ) : null}
      </div>
      {caption ? <p className="mt-1 text-xs text-zinc-500">{caption}</p> : null}
    </figure>
  );
}
