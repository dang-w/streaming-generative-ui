"use client";

import { SCHEMA_NAME } from "@/lib/bandMeta";
import { EXAMPLES } from "@/lib/exampleArtifacts";
import { registry, type ArtifactKind } from "@/lib/registry";
import { renderArtifact } from "@/lib/renderArtifact";
import { schemaSource } from "@/lib/schemaSource";

// Hatch swatches per kind (mirrors the LIVE RegistryStrip legend).
const HATCH: Record<ArtifactKind, string> = {
  chart:
    "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 3px),repeating-linear-gradient(-45deg,#555 0 0.6px,transparent 0.6px 3px)",
  metric: "repeating-linear-gradient(0deg,#555 0 0.6px,transparent 0.6px 4px)",
  table: "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 8px)",
  text: "repeating-linear-gradient(45deg,#999 0 0.6px,transparent 0.6px 5px,#999 5px 5.6px,transparent 5.6px 8px)",
};

const COMPONENT_NAME: Record<ArtifactKind, string> = {
  chart: "ChartArtifact",
  table: "TableArtifact",
  metric: "MetricArtifact",
  text: "TextArtifact",
};

function Panel({
  label,
  refName,
  testId,
  children,
}: {
  label: string;
  refName: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 border-[0.5px] border-ink-3">
      <div className="flex items-baseline justify-between border-b-[0.5px] border-ink-4 px-3.5 py-2 text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
        <span>{label}</span>
        <b className="font-bold text-ink-2">{refName}</b>
      </div>
      <div className="p-4" data-testid={testId}>
        {children}
      </div>
    </div>
  );
}

export function RegistryExplorer({
  kind,
  onSelect,
}: {
  kind: ArtifactKind;
  onSelect: (k: ArtifactKind) => void;
}) {
  const kinds = Object.keys(registry) as ArtifactKind[];
  const entry = registry[kind];
  const schemaName = SCHEMA_NAME[kind];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-[14px] font-bold text-ink-1">Registry Explorer</div>
        <div className="text-[10px] tracking-[0.1em] text-ink-2">
          INTERNALS · <b className="text-ink-1">BREADTH</b> — user-driven
        </div>
      </div>
      <div className="mb-5 mt-1.5 text-[10px] tracking-[0.04em] text-ink-3">
        {"// the registry, exposed. click any kind — its example, entry & schema all derive from one row."}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* LEFT — interactive registry */}
        <div>
          <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-2">
            The Registry · {kinds.length} kinds
          </div>
          {kinds.map((k) => {
            const active = k === kind;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(k)}
                className={`mb-0.5 grid w-full grid-cols-[24px_1fr_auto] items-center gap-3 border-[0.5px] px-3 py-3 text-left text-[11px] ${
                  active
                    ? "border-orange bg-orange/[0.07]"
                    : "border-transparent opacity-55 hover:bg-paper-zone hover:opacity-100"
                }`}
              >
                <span
                  className="h-[13px] w-[22px] border-[0.5px] border-ink-2"
                  style={{ background: HATCH[k] }}
                />
                <span className={`tracking-[0.06em] text-ink-1 ${active ? "font-bold" : ""}`}>
                  {k.toUpperCase()}
                </span>
                <span className="text-[10px] text-amber">{SCHEMA_NAME[k]}</span>
              </button>
            );
          })}
          <p className="mt-3.5 text-[9px] leading-relaxed tracking-[0.02em] text-ink-3">
            {"// one row = one capability. add a fifth row and the union, the model's tool, runtime validation & rendering all update in sync — no switch, nothing to drift."}
          </p>
        </div>

        {/* RIGHT — the selected kind, exposed three ways */}
        <div>
          <Panel label="Example · live render" refName={kind} testId="registry-example">
            {renderArtifact(kind, EXAMPLES[kind])}
          </Panel>

          <Panel label="Registry entry" refName="lib/registry.ts" testId="registry-entry">
            <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-ink-1">
              {`${kind}: entry(\n  ${schemaName},\n  ${COMPONENT_NAME[kind]},\n  "${entry.description}",\n)`}
            </pre>
          </Panel>

          <Panel label="Schema" refName="lib/schemas.ts" testId="registry-schema">
            <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-ink-1">
              {schemaSource(schemaName)}
            </pre>
          </Panel>
        </div>
      </div>
    </div>
  );
}
