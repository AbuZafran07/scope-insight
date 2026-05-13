import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — PengadaanScope" },
      { name: "description", content: "Daftar paket B2G & prospek B2B yang di-bookmark." },
    ],
  }),
  component: () => (
    <AppShell>
      <Placeholder
        icon={<Bookmark className="h-5 w-5" />}
        title="Watchlist"
        description="TAHAP 5: daftar bookmark gabungan B2G + B2B dengan filter status & export Excel."
      />
    </AppShell>
  ),
});
