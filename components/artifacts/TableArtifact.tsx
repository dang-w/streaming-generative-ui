import type { z } from "zod";

import type { tableSchema } from "@/lib/schemas";

export type TableProps = z.infer<typeof tableSchema>;

export function TableArtifact({ title, columns, rows }: TableProps) {
  return (
    <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {title && (
        <figcaption className="border-b border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          {title}
        </figcaption>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((_, j) => {
                  const cell = row[j];
                  return (
                    <td key={j} className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                      {cell === null || cell === undefined ? "—" : String(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
