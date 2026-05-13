import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PengadaanScope" },
      {
        name: "description",
        content: "Grafik & ringkasan nasional pengadaan pemerintah & prospek swasta.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Placeholder
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics Nasional"
        description="TAHAP 5: 6 grafik Recharts (top provinsi, kategori produk, tren bulanan, top instansi, status, prospek per sektor)."
      />
    </AppShell>
  ),
});
