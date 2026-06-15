import { z } from "zod";

export const chartSchema = z.object({
  variant: z.enum(["bar", "line"]),
  title: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .min(1)
    .describe("Series points; one value per label."),
});

export const tableSchema = z.object({
  title: z.string().optional(),
  columns: z.array(z.string()).min(1).describe("Column headers, in order."),
  rows: z
    .array(z.array(z.union([z.string(), z.number(), z.null()])))
    .describe("Row cells, in column order. null renders as em-dash."),
});

export const textSchema = z.object({
  markdown: z.string().describe("Markdown body for a deliberate prose block."),
});
