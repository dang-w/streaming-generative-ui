// Vite (Vitest) and Next/Turbopack both resolve `?raw` imports to the file's
// text content; this declaration lets TypeScript accept them.
declare module "*?raw" {
  const content: string;
  export default content;
}
