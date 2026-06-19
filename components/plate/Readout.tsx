import type { StreamStatus } from "@/hooks/useArtifactStream";

function Row({
  k,
  children,
  testId,
  tone,
}: {
  k: string;
  children: React.ReactNode;
  testId?: string;
  tone?: "amber" | "active" | "done";
}) {
  const vClass =
    tone === "amber"
      ? "text-amber"
      : tone === "active"
        ? "font-bold text-orange"
        : tone === "done"
          ? "font-bold text-ink-2"
          : "text-ink-1";
  return (
    <div className="flex justify-between">
      <span className="tracking-[0.06em] text-ink-3">{k}</span>
      <span className={vClass} data-testid={testId}>
        {children}
      </span>
    </div>
  );
}

export function Readout({
  status,
  artifactCount,
  adapter,
  model,
}: {
  status: StreamStatus;
  artifactCount: number;
  adapter: string | null;
  model: string | null;
}) {
  const stateLabel = status === "streaming" ? "STREAMING" : status.toUpperCase();
  const stateTone =
    status === "streaming" ? "active" : status === "done" ? "done" : undefined;

  const modelLabel =
    adapter === null ? "—" : adapter === "stub" ? "stub · canned" : (model ?? adapter);

  return (
    <div className="min-w-[300px] border-[0.5px] border-ink-3 px-3.5 py-2.5 text-[10px] leading-[1.95] text-ink-2">
      <Row k="MODEL">{modelLabel}</Row>
      <Row k="PATTERN" tone="amber">
        typed registry
      </Row>
      <Row k="TRANSPORT">SSE</Row>
      <Row k="ARTIFACTS" testId="readout-artifacts">
        {artifactCount}
      </Row>
      <Row k="BATCH">rAF · text</Row>
      <Row k="STATE" testId="readout-state" tone={stateTone}>
        {stateLabel}
      </Row>
    </div>
  );
}
