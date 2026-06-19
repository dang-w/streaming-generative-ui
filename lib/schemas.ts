import { z } from "zod";

export const chartSchema = z.object({
  variant: z.enum(["bar", "line"]),
  title: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  data: z
    .array(z.object({ label: z.string(), value: z.number().finite() }))
    .min(1)
    .describe("Series points; one value per label."),
});

export const tableSchema = z
  .object({
    title: z.string().optional(),
    columns: z.array(z.string()).min(1).describe("Column headers, in order."),
    rows: z
      .array(z.array(z.union([z.string(), z.number(), z.null()])))
      .describe("Row cells, in column order. null renders as em-dash."),
  })
  // Reject ragged rows: a row shorter/longer than `columns` would silently drop
  // cells or fabricate em-dash nulls in TableArtifact, so it must render the
  // InvalidArtifact fallback rather than corrupt the data.
  .superRefine((val, ctx) => {
    val.rows.forEach((row, i) => {
      if (row.length !== val.columns.length) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", i],
          message: `row ${i} has ${row.length} cells; expected ${val.columns.length} (one per column)`,
        });
      }
    });
  });

export const textSchema = z.object({
  markdown: z.string().describe("Markdown body for a deliberate prose block."),
});

export const metricSchema = z.object({
  label: z.string().describe("What the metric measures, e.g. 'Monthly active users'."),
  value: z
    .union([z.string(), z.number().finite()])
    .describe("The headline value to display large."),
  unit: z.string().optional().describe("Optional unit suffix, e.g. '%', 'ms', 'k'."),
  delta: z
    .number()
    .finite()
    .optional()
    .describe("Optional change vs the prior period; sign drives up/down styling."),
  caption: z
    .string()
    .optional()
    .describe("Optional one-line context shown under the value."),
});
