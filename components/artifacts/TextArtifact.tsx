import ReactMarkdown from "react-markdown";
import type { z } from "zod";

import type { textSchema } from "@/lib/schemas";

export type TextProps = z.infer<typeof textSchema>;

export function TextArtifact({ markdown }: TextProps) {
  return (
    <article className="prose prose-sm max-w-[66ch] text-ink-1 prose-headings:text-ink-1 prose-strong:text-ink-1 prose-a:text-orange">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
