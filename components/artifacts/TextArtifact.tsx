import ReactMarkdown from "react-markdown";
import type { z } from "zod";

import type { textSchema } from "@/lib/schemas";

export type TextProps = z.infer<typeof textSchema>;

export function TextArtifact({ markdown }: TextProps) {
  return (
    <article className="prose prose-sm prose-zinc max-w-none rounded-lg border border-zinc-200 bg-white p-4 dark:prose-invert dark:border-zinc-800 dark:bg-zinc-950">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
