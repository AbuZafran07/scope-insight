import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Map } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PengadaanScope" },
      {
        name: "description",
        content:
          "Dashboard intelijen peluang bisnis nasional: peta interaktif paket pengadaan & prospek swasta.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell
      kpis={[
        { label: "Total Paket B2G", value: "—", hint: "Sinkron belum dijalankan", accent: "green" },
        { label: "Est. Total Pagu", value: "—", hint: "Potensi pasar", accent: "blue" },
        { label: "Prospek Panas", value: "—", hint: "Prioritas hubungi", accent: "red" },
        { label: "Prospek Hangat", value: "—", hint: "Follow-up", accent: "amber" },
        { label: "Kota Terjangkau", value: "—", hint: "Sebaran nasional", accent: "teal" },
      ]}
    >
      <aside className="w-[265px] shrink-0 border-r border-border bg-card overflow-y-auto p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Filter Universal
        </div>
        <input
          placeholder="Cari paket, instansi, kota…"
          className="w-full bg-card-2 border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-green"
        />
        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
          Daftar paket B2G & prospek B2B akan tampil di sini setelah TAHAP 3 & 4 dibangun.
        </p>
      </aside>
      <Placeholder
        icon={<Map className="h-5 w-5" />}
        title="Peta Indonesia akan tampil di sini"
        description="TAHAP 2: integrasi Leaflet + GeoJSON 34 provinsi dengan choropleth coloring & bubble markers."
      />
    </AppShell>
  );
}
