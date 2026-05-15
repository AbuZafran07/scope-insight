import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Users } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — PengadaanScope" },
      { name: "description", content: "Kelola anggota tim, peran, dan akses workspace PengadaanScope." },
    ],
  }),
  component: () => (
    <AppShell>
      <Placeholder
        icon={<Users className="h-5 w-5" />}
        title="Team"
        description="Undang anggota tim, atur peran (Owner / Analyst / Viewer), dan kelola akses watchlist bersama."
      />
    </AppShell>
  ),
});
