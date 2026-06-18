"use client";

import { useState } from "react";

import { LiveView } from "@/components/plate/LiveView";
import { ModeSwitcher } from "@/components/plate/ModeSwitcher";
import { PlateShell } from "@/components/plate/PlateShell";
import { RegistryExplorer } from "@/components/plate/RegistryExplorer";
import { XRayWalkthrough } from "@/components/plate/XRayWalkthrough";
import { useMode } from "@/hooks/useMode";
import type { ArtifactKind } from "@/lib/registry";

export default function Home() {
  const [mode, setMode] = useMode();
  const [registryKind, setRegistryKind] = useState<ArtifactKind>("chart");

  // Clicking a kind in the LIVE registry strip jumps to the explorer focused on it.
  const openRegistry = (k: ArtifactKind) => {
    setRegistryKind(k);
    setMode("registry");
  };

  return (
    <PlateShell>
      <ModeSwitcher mode={mode} onChange={setMode} />
      {mode === "live" && <LiveView onKindSelect={openRegistry} />}
      {mode === "xray" && <XRayWalkthrough />}
      {mode === "registry" && (
        <RegistryExplorer kind={registryKind} onSelect={setRegistryKind} />
      )}
    </PlateShell>
  );
}
