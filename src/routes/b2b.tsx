import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/b2b")({
  head: () => ({
    meta: [
      { title: "B2B — Prospek Swasta | PengadaanScope" },
      {
        name: "description",
        content:
          "Mode B2B: prospek perusahaan swasta (pest control, hotel, F&B, pabrik, distributor) dari Google Places.",
      },
    ],
  }),
  component: () => (
    <AppShell
      kpis={[
        { label: "Total Prospek", value: "—", accent: "teal" },
        { label: "Prospek Panas 🔥", value: "—", accent: "red" },
        { label: "Prospek Hangat ⚡", value: "—", accent: "amber" },
        { label: "Kota Terjangkau", value: "—", accent: "blue" },
        { label: "Sektor Aktif", value: "—", accent: "green" },
      ]}
    >
      <Placeholder
        icon={<Briefcase className="h-5 w-5" />}
        title="Mode B2B — Prospek Swasta"
        description="TAHAP 4: pencarian Google Places per sektor & kota, status prospek, & AI draft email penawaran."
      />
    </AppShell>
  ),
});
