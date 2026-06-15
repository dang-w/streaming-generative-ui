import type { ZodError } from "zod";

export function InvalidArtifact({ kind, error }: { kind: string; error: ZodError }) {
  return (
    <aside
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-950"
    >
      <p className="font-medium text-red-900 dark:text-red-200">
        Invalid <code className="font-mono">{kind}</code> artifact
      </p>
      <p className="mt-1 text-red-800 dark:text-red-300">
        Props failed schema validation:
      </p>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 font-mono text-xs text-red-800 dark:text-red-300">
        {error.issues.map((issue, i) => (
          <li key={i}>
            <span className="opacity-70">{issue.path.join(".") || "(root)"}:</span>{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </aside>
  );
}
