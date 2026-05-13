import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Settings as Cog } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PengadaanScope" },
      { name: "description", content: "Profil perusahaan, preferensi filter, & integrasi API." },
    ],
  }),
  component: () => (
    <AppShell>
      <Placeholder
        icon={<Cog className="h-5 w-5" />}
        title="Settings"
        description="TAHAP 5: profil perusahaan, preferensi filter default, notifikasi, dan status integrasi SIRUP/Places."
      />
    </AppShell>
  ),
});
