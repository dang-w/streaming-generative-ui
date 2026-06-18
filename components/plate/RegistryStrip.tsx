import { HATCH, SCHEMA_NAME } from "@/lib/bandMeta";
import { registry, type ArtifactKind } from "@/lib/registry";

export function RegistryStrip({ onSelect }: { onSelect?: (k: ArtifactKind) => void }) {
  const kinds = Object.keys(registry) as ArtifactKind[];
  return (
    <div className="mt-5 border-[0.5px] border-ink-3 px-4 py-3">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-2">
          Artifact Schedule · the registry
        </span>
        <span className="text-[9px] tracking-[0.03em] text-ink-3">
          {"// one entry per kind — tool, validation & render all derive from it"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-2 md:grid-cols-4">
        {kinds.map((kind) => {
          const inner = (
            <>
              <span
                className="h-[13px] w-[22px] flex-none border-[0.5px] border-ink-2"
                style={{ background: HATCH[kind] }}
              />
              <span className="text-ink-1">{kind.toUpperCase()}</span>
              <span className="ml-auto tracking-[0.03em] text-amber">{SCHEMA_NAME[kind]}</span>
            </>
          );
          return onSelect ? (
            <button
              key={kind}
              type="button"
              onClick={() => onSelect(kind)}
              className="flex items-center gap-2.5 text-left text-[10.5px] hover:text-orange"
            >
              {inner}
            </button>
          ) : (
            <div key={kind} className="flex items-center gap-2.5 text-[10.5px]">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
