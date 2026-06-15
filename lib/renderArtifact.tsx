import type { ComponentType } from "react";

import { InvalidArtifact } from "@/components/artifacts/InvalidArtifact";
import { UnknownArtifact } from "@/components/artifacts/UnknownArtifact";

import { registry } from "./registry";

export function renderArtifact(kind: string, props: unknown) {
  const entry = registry[kind as keyof typeof registry];
  if (!entry) {
    return <UnknownArtifact kind={kind} />;
  }

  const parsed = entry.schema.safeParse(props);
  if (!parsed.success) {
    return <InvalidArtifact kind={kind} error={parsed.error} />;
  }

  // Registry lookup + safeParse have verified that parsed.data matches the
  // component's prop type, but TS can't connect the two through the string key.
  const Component = entry.Component as ComponentType<typeof parsed.data>;
  return <Component {...parsed.data} />;
}
