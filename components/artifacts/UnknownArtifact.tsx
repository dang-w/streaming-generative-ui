export function UnknownArtifact({ kind }: { kind: string }) {
  return (
    <aside role="status" className="border-l-2 border-amber bg-paper-zone px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.16em] text-amber">
        Off-spec — unknown kind <span className="text-ink-1">{kind}</span>
      </p>
      <p className="mt-1 text-[10px] text-ink-2">
        Not in the registry; no entry resolved. Rendered as a fallback, not thrown.
      </p>
    </aside>
  );
}
