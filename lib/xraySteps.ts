export type XRayStepId = "tool-call" | "registry-lookup" | "validate" | "render";

export type XRayStep = {
  n: number;
  id: XRayStepId;
  title: string;
  code: string;
  directive: string;
};

/** The fixed render pipeline, in data-flow order — what X-RAY walks one step at a time. */
export const XRAY_STEPS: XRayStep[] = [
  {
    n: 1,
    id: "tool-call",
    title: "STREAMING TOOL-CALL",
    code: 'tool_use "chart"',
    directive:
      "The model emits a tool_use block named chart — plain text stops, structured output begins. The tool name is the only routing key the client needs.",
  },
  {
    n: 2,
    id: "registry-lookup",
    title: "REGISTRY LOOKUP",
    code: 'registry["chart"]',
    directive:
      "registry[\"chart\"] resolves the entry — one of four registered kinds, chosen by a lookup, not a switch. The same entry carries the schema, the tool, and the component.",
  },
  {
    n: 3,
    id: "validate",
    title: "VALIDATE",
    code: "chartSchema.safeParse(input)",
    directive:
      "chartSchema.safeParse(input) runs at the render boundary. Valid input flows through; invalid input would render a labelled fallback instead of throwing.",
  },
  {
    n: 4,
    id: "render",
    title: "RENDER",
    code: "renderArtifact() → <ChartArtifact/>",
    directive:
      "renderArtifact validates the props and renders them into the typed component — the lookup and validation above happen inside this one call. What you watched stream in LIVE is exactly this path, slowed down.",
  },
];
