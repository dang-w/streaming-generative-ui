"use client";

import { useEffect, useState } from "react";

import { ArtifactBand } from "@/components/plate/ArtifactBand";
import { Masthead } from "@/components/plate/Masthead";
import { Readout } from "@/components/plate/Readout";
import { RegistryStrip } from "@/components/plate/RegistryStrip";
import { ZoneTag } from "@/components/plate/ZoneTag";
import { useArtifactStream } from "@/hooks/useArtifactStream";
import { bandCaption, groupTimeline, streamingItemId } from "@/lib/bandMeta";
import type { ArtifactKind } from "@/lib/registry";
import { renderArtifact } from "@/lib/renderArtifact";

const EXAMPLE_PROMPT =
  "Show me a quarterly performance snapshot: a sales trend chart, a few headline metrics, a table of top accounts, and a final, overall text summary.";

export function LiveView({ onKindSelect }: { onKindSelect?: (k: ArtifactKind) => void }) {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const { items, status, error, send, reset } = useArtifactStream();

  const artifactCount = items.filter((it) => it.type === "artifact").length;
  const activeId = streamingItemId(items, status);
  const units = groupTimeline(items);

  const lastItem = items[items.length - 1];
  const lastUnit = lastItem
    ? units.find((u) =>
        u.kind === "item" ? u.id === lastItem.id : u.items.some((m) => m.id === lastItem.id),
      )
    : undefined;
  const lastUnitId = lastUnit?.id ?? null;

  useEffect(() => {
    if (status !== "streaming" || !lastUnitId) return;
    const el = document.getElementById(`band-${lastUnitId}`);
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [lastUnitId, status]);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || status === "streaming") return;
    send(trimmed);
  };

  return (
    <>
      {/* ===== ZONE 1 — INSTRUMENT ===== */}
      <div className="mb-1 border-b-[1.4px] border-ink-1 pb-[22px]">
        <ZoneTag label="System · internals" />
        <div className="flex items-start justify-between gap-[30px]">
          <Masthead onReset={reset} showReset={items.length > 0} />
          <Readout status={status} artifactCount={artifactCount} />
        </div>
        <RegistryStrip onSelect={onKindSelect} />
      </div>

      {/* ===== ZONE 2 — STREAM ===== */}
      <div className="pt-[22px]">
        <ZoneTag label="Output · streamed" />
        <form className="mb-6" onSubmit={onSubmit}>
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-3">Prompt</div>
          <div className="mt-2 flex items-stretch gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              disabled={status === "streaming"}
              className="flex-1 resize-none border-[0.8px] border-ink-2 bg-paper-zone px-3.5 py-3 text-xs text-ink-1 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || status === "streaming"}
              className="border border-ink-1 bg-paper px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-1 disabled:opacity-40"
            >
              ▶ Generate
            </button>
          </div>
        </form>

        {error && (
          <aside
            role="alert"
            className="mb-6 border-l-2 border-red bg-paper-zone px-4 py-3 text-[10px] text-ink-2"
          >
            <span className="text-[9px] uppercase tracking-[0.16em] text-red">
              Stream error —{" "}
            </span>
            {error}
          </aside>
        )}

        {units.map((unit) =>
          unit.kind === "metricGroup" ? (
            <div id={`band-${unit.id}`} key={unit.id}>
              <ArtifactBand caption="Headline Metrics" kind="metric" streaming={false}>
                <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
                  {unit.items.map((m) =>
                    m.type === "artifact" ? (
                      <div key={m.id}>{renderArtifact(m.kind, m.props)}</div>
                    ) : null,
                  )}
                </div>
              </ArtifactBand>
            </div>
          ) : (
            <div id={`band-${unit.id}`} key={unit.id}>
              <ArtifactBand
                caption={bandCaption(unit.item)}
                kind={
                  unit.item.type === "text"
                    ? "text"
                    : (unit.item.kind as "chart" | "table" | "metric" | "text")
                }
                streaming={unit.item.id === activeId}
              >
                {unit.item.type === "text" ? (
                  <article className="prose prose-sm max-w-none text-ink-1">
                    {unit.item.text}
                    {unit.item.id === activeId && <span className="stream-cursor" />}
                  </article>
                ) : (
                  renderArtifact(unit.item.kind, unit.item.props)
                )}
              </ArtifactBand>
            </div>
          ),
        )}
      </div>
    </>
  );
}
