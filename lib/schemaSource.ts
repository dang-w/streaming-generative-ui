import schemasSource from "@/lib/schemas.ts?raw";

/**
 * The real Zod source for an exported schema, sliced from lib/schemas.ts via a
 * `?raw` import — so the displayed schema is the literal file content and cannot
 * drift from what actually validates. Returns "" if the export isn't found.
 */
export function schemaSource(exportName: string): string {
  const marker = `export const ${exportName} =`;
  const start = schemasSource.indexOf(marker);
  if (start === -1) return "";
  const rest = schemasSource.slice(start);
  const next = rest.indexOf("\nexport const ", 1);
  const block = next === -1 ? rest : rest.slice(0, next);
  return block.replace(/^export const /, "").trimEnd();
}
