import type { ReactNode } from "react";

export function PlateShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-[30px]">
      <div className="plate-sheet mx-auto max-w-[1180px]" data-testid="plate-sheet">
        <div className="relative px-[30px] pt-6 pb-7">{children}</div>
      </div>
    </div>
  );
}
