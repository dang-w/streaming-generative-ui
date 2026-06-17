"use client";

import type { z } from "zod";

import { Chart } from "@/components/artifacts/Chart";
import type { chartSchema } from "@/lib/schemas";

export type ChartProps = z.infer<typeof chartSchema> & { animate?: boolean };

export function ChartArtifact({ variant, yLabel, data, animate }: ChartProps) {
  return <Chart variant={variant} data={data} yLabel={yLabel} animate={animate} />;
}
