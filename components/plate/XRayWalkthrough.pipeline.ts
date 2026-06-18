import { registry } from "@/lib/registry";
import { chartSchema } from "@/lib/schemas";
import { STUB_CHART_INPUT } from "@/lib/model/stub";

/**
 * Runs the REAL pipeline once for the exemplar so X-RAY narrates true facts:
 * the actual registry entry, the actual safeParse result, the actual props.
 */
export function runPipeline() {
  const entry = registry.chart;
  const parsed = chartSchema.safeParse(STUB_CHART_INPUT);
  return { entry, valid: parsed.success, exemplar: STUB_CHART_INPUT };
}
