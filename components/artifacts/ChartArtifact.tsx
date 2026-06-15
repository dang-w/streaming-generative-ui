"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { z } from "zod";

import type { chartSchema } from "@/lib/schemas";

export type ChartProps = z.infer<typeof chartSchema>;

export function ChartArtifact({ variant, title, xLabel, yLabel, data }: ChartProps) {
  const Chart = variant === "bar" ? BarChart : LineChart;
  const Series = variant === "bar" ? Bar : Line;

  return (
    <figure className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      {title && (
        <figcaption className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </figcaption>
      )}
      <ResponsiveContainer width="100%" height={240}>
        <Chart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            label={xLabel ? { value: xLabel, position: "insideBottom", offset: -4 } : undefined}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft" } : undefined}
          />
          <Tooltip />
          <Series dataKey="value" fill="#3b82f6" stroke="#3b82f6" />
        </Chart>
      </ResponsiveContainer>
    </figure>
  );
}
