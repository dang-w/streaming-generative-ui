export function Masthead({
  onReset,
  showReset,
}: {
  onReset: () => void;
  showReset: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-[30px]">
      <div>
        <h1 className="m-0 text-[22px] font-bold tracking-[0.02em] text-ink-1">
          Streaming generative UI
        </h1>
        <p className="mt-2 max-w-[42ch] text-[11px] leading-relaxed text-ink-2">
          A typed component registry rendered from a streamed agent response.
        </p>
      </div>
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-[9px] uppercase tracking-[0.1em] text-ink-3 hover:text-orange"
        >
          ⟲ Clear
        </button>
      )}
    </div>
  );
}
