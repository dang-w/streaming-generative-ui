import { MODES, type Mode } from "@/lib/mode";

const LABEL: Record<Mode, string> = {
  live: "LIVE",
  xray: "X-RAY",
  registry: "REGISTRY",
};

// REGISTRY is the Phase C explorer — present but disabled for now.
const DISABLED: Record<Mode, boolean> = { live: false, xray: false, registry: true };

export function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="inline-flex border-[0.8px] border-ink-1">
        {MODES.map((m) => {
          const active = m === mode;
          const disabled = DISABLED[m];
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => !disabled && onChange(m)}
              className={[
                "border-r-[0.5px] border-ink-3 px-[22px] py-2.5 text-[11px] uppercase tracking-[0.14em] last:border-r-0",
                active
                  ? "bg-orange font-bold text-paper"
                  : disabled
                    ? "cursor-not-allowed text-ink-4"
                    : "text-ink-3 hover:text-ink-1",
              ].join(" ")}
            >
              {LABEL[m]}
              {disabled && <span className="ml-1.5 text-[8px] text-ink-4">soon</span>}
            </button>
          );
        })}
      </div>
      <div className="text-[9px] uppercase tracking-[0.08em] text-ink-3">
        <b className="text-ink-2">LIVE</b> — prompt &amp; watch it stream ·{" "}
        <b className="text-ink-2">X-RAY</b> — guided walkthrough ·{" "}
        <b className="text-ink-2">REGISTRY</b> — explore the kinds
      </div>
    </div>
  );
}
