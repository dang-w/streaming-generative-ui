import type { ZodError } from "zod";

export function InvalidArtifact({ kind, error }: { kind: string; error: ZodError }) {
  return (
    <aside role="alert" className="border-l-2 border-red bg-paper-zone px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.16em] text-red">
        Off-spec — <span className="text-ink-1">{kind}</span> failed validation
      </p>
      <p className="mt-1 text-[10px] text-ink-2">
        Schema rejected the model&apos;s props; rendered as a fallback, not thrown.
      </p>
      <ul className="mt-2 space-y-0.5 font-mono text-[10px] text-ink-2">
        {error.issues.map((issue, i) => (
          <li key={i}>
            <span className="text-ink-3">{issue.path.join(".") || "(root)"}:</span>{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </aside>
  );
}
