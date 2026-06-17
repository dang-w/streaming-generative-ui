"use client";

import { useEffect, useState } from "react";
import type { z } from "zod";

import type { tableSchema } from "@/lib/schemas";

export type TableProps = z.infer<typeof tableSchema>;

function isNumeric(v: string | number | null) {
  return typeof v === "number";
}

export function TableArtifact({ columns, rows }: TableProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="border-[0.5px] border-ink-3 bg-paper px-[18px] pb-3.5 pt-4">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {columns.map((c, j) => (
              <th
                key={c}
                className={`border-b-[0.5px] border-ink-3 px-2.5 py-2 text-[8.5px] uppercase tracking-[0.12em] text-ink-3 ${
                  rows.some((r) => isNumeric(r[j])) ? "text-right" : "text-left"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              data-role="row"
              className={`stagger${shown ? " in" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {columns.map((_, j) => {
                const cell = row[j];
                return (
                  <td
                    key={j}
                    className={`border-b-[0.5px] border-ink-4 px-2.5 py-2 text-ink-1 ${
                      isNumeric(cell) ? "text-right tabular-nums" : "text-left"
                    }`}
                  >
                    {cell === null || cell === undefined ? "—" : String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
