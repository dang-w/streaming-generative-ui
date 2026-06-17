"use client";

import { useState } from "react";

import { ArtifactBand } from "@/components/plate/ArtifactBand";
import { Masthead } from "@/components/plate/Masthead";
import { PlateShell } from "@/components/plate/PlateShell";
import { Readout } from "@/components/plate/Readout";
import { RegistryStrip } from "@/components/plate/RegistryStrip";
import { ZoneTag } from "@/components/plate/ZoneTag";
import { useArtifactStream } from "@/hooks/useArtifactStream";
import { bandCaption, streamingItemId } from "@/lib/bandMeta";
import { renderArtifact } from "@/lib/renderArtifact";

const EXAMPLE_PROMPT =
  "Show me a quarterly performance snapshot: a sales trend chart, a few headline metrics, and a table of top accounts.";

export default function Home() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const { items, status, error, send, reset } = useArtifactStream();

  const artifactCount = items.filter((it) => it.type === "artifact").length;
  const activeId = streamingItemId(items, status);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || status === "streaming") return;
    send(trimmed);
  };

  return (
    <PlateShell>
      {/* ===== ZONE 1 — INSTRUMENT ===== */}
      <div className="mb-1 border-b-[1.4px] border-ink-1 pb-[22px]">
        <ZoneTag label="System · internals" />
        <div className="flex items-start justify-between gap-[30px]">
          <Masthead onReset={reset} showReset={items.length > 0} />
          <Readout status={status} artifactCount={artifactCount} />
        </div>
        <RegistryStrip />
      </div>

      {/* ===== ZONE 2 — STREAM ===== */}
      <div className="pt-[22px]">
        <ZoneTag label="Output · streamed" />
        <form className="mb-6" onSubmit={onSubmit}>
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-3">
            Prompt
          </div>
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

        {items.map((item) => (
          <ArtifactBand
            key={item.id}
            caption={bandCaption(item)}
            kind={item.type === "text" ? "text" : (item.kind as "chart" | "table" | "metric" | "text")}
            streaming={item.id === activeId}
          >
            {item.type === "text" ? (
              <article className="prose prose-sm max-w-[66ch] text-ink-1">
                {item.text}
                {item.id === activeId && <span className="stream-cursor" />}
              </article>
            ) : (
              renderArtifact(item.kind, item.props)
            )}
          </ArtifactBand>
        ))}
      </div>
    </PlateShell>
  );
}
