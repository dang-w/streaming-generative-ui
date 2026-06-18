"use client";

import { LiveView } from "@/components/plate/LiveView";
import { ModeSwitcher } from "@/components/plate/ModeSwitcher";
import { PlateShell } from "@/components/plate/PlateShell";
import { RegistryPlaceholder } from "@/components/plate/RegistryPlaceholder";
import { XRayWalkthrough } from "@/components/plate/XRayWalkthrough";
import { useMode } from "@/hooks/useMode";

export default function Home() {
  const [mode, setMode] = useMode();

  return (
    <PlateShell>
      <ModeSwitcher mode={mode} onChange={setMode} />
      {mode === "live" && <LiveView />}
      {mode === "xray" && <XRayWalkthrough />}
      {mode === "registry" && <RegistryPlaceholder />}
    </PlateShell>
  );
}
