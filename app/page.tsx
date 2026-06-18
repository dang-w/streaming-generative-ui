"use client";

import { LiveView } from "@/components/plate/LiveView";
import { ModeSwitcher } from "@/components/plate/ModeSwitcher";
import { PlateShell } from "@/components/plate/PlateShell";
import { RegistryPlaceholder } from "@/components/plate/RegistryPlaceholder";
import { useMode } from "@/hooks/useMode";

export default function Home() {
  const [mode, setMode] = useMode();

  return (
    <PlateShell>
      <ModeSwitcher mode={mode} onChange={setMode} />
      {mode === "live" && <LiveView />}
      {mode === "xray" && (
        <div className="border-[0.5px] border-ink-3 bg-paper-zone px-6 py-10 text-center text-[12px] text-ink-2">
          X-RAY walkthrough — wiring up next.
        </div>
      )}
      {mode === "registry" && <RegistryPlaceholder />}
    </PlateShell>
  );
}
