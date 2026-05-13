import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/b2g")({
  head: () => ({
    meta: [
      { title: "B2G — Pengadaan Pemerintah | PengadaanScope" },
      {
        name: "description",
        content:
          "Mode B2G: peluang pengadaan pemerintah dari SIRUP LKPP TA 2026 untuk supplier alkes, pest control & lab.",
      },
    ],
  }),
  component: () => (
    <AppShell
      kpis={[
        { label: "Total Paket Relevan", value: "—", accent: "green" },
        { label: "Est. Nilai Pagu", value: "—", accent: "blue" },
        { label: "Siap Tender", value: "—", accent: "amber" },
        { label: "Provinsi Aktif", value: "—", accent: "teal" },
        { label: "Relevansi >90%", value: "—", accent: "red" },
      ]}
    >
      <Placeholder
        icon={<Building2 className="h-5 w-5" />}
        title="Mode B2G — Pengadaan Pemerintah"
        description="TAHAP 3: integrasi SIRUP LKPP, sinkron paket RUP ke database, dan AI scoring relevansi."
      />
    </AppShell>
  ),
});
