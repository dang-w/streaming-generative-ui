"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { useArtifactStream } from "@/hooks/useArtifactStream";
import { renderArtifact } from "@/lib/renderArtifact";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const { items, status, error, send, reset } = useArtifactStream();

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || status === "streaming") return;
    send(trimmed);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Streaming generative UI
          </h1>
          <p className="text-sm text-zinc-500">
            A typed component registry rendered from a streamed agent response.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </header>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. show me a quarterly sales chart and a one-paragraph summary, with a short narration first"
          rows={3}
          disabled={status === "streaming"}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || status === "streaming"}
          className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {status === "streaming" ? "Streaming…" : "Generate"}
        </button>
      </form>

      {error && (
        <aside
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </aside>
      )}

      <section className="flex flex-col gap-4" aria-label="Stream output">
        {items.map((item) =>
          item.type === "text" ? (
            <div
              key={item.id}
              className="prose prose-sm prose-zinc max-w-none text-zinc-700 dark:prose-invert dark:text-zinc-300"
            >
              <ReactMarkdown>{item.text}</ReactMarkdown>
            </div>
          ) : (
            <div key={item.id}>{renderArtifact(item.kind, item.props)}</div>
          ),
        )}
      </section>
    </main>
  );
}
