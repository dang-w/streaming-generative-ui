"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SCHEMA_NAME } from "@/lib/bandMeta";
import type { ArtifactKind } from "@/lib/registry";

export function ArtifactBand({
  caption,
  kind,
  streaming,
  children,
}: {
  caption: string;
  kind: ArtifactKind | "text";
  streaming: boolean;
  children: ReactNode;
}) {
  // Start hidden and flip on the next frame so the .band → .band.show CSS
  // transition actually fires (mount === stream-in).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const schema = SCHEMA_NAME[kind as ArtifactKind] ?? `${kind}Schema`;
  return (
    <div className={`band mb-6${mounted ? " show" : ""}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-2">
          {caption}
        </span>
        <span className="text-[8.5px] uppercase tracking-[0.06em] text-ink-3">
          <b className="font-bold text-amber">{kind}</b> · <span>{schema}</span>
        </span>
      </div>
      <div
        data-testid="band-view"
        className={`band-view${streaming ? " is-streaming" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
