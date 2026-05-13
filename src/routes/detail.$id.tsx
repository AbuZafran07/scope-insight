import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Placeholder } from "@/components/layout/Placeholder";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/detail/$id")({
  head: () => ({
    meta: [{ title: "Detail — PengadaanScope" }],
  }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  return (
    <AppShell>
      <Placeholder
        icon={<FileText className="h-5 w-5" />}
        title={`Detail item: ${id}`}
        description="Halaman detail penuh akan dibangun setelah panel detail samping selesai (TAHAP 3 & 4)."
      />
    </AppShell>
  );
}
