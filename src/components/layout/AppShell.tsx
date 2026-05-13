import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { KpiBar } from "./KpiBar";

type Kpi = Parameters<typeof KpiBar>[0]["items"][number];

export function AppShell({
  kpis,
  children,
}: {
  kpis?: Kpi[];
  children: ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Topbar />
      {kpis && <KpiBar items={kpis} />}
      <main className="flex-1 min-h-0 flex">{children}</main>
    </div>
  );
}
