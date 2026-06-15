export function UnknownArtifact({ kind }: { kind: string }) {
  return (
    <aside
      role="status"
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950"
    >
      <p className="font-medium text-amber-900 dark:text-amber-200">
        Unknown artifact: <code className="font-mono">{kind}</code>
      </p>
      <p className="mt-1 text-amber-800 dark:text-amber-300">
        The model emitted an artifact type that isn&apos;t in the registry.
      </p>
    </aside>
  );
}
