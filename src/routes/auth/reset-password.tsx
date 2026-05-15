import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — PengadaanScope" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password berhasil diubah");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Reset password" subtitle="Masukkan password baru Anda">
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Password baru" type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-md bg-accent-green text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan password"}
        </button>
      </form>
    </AuthShell>
  );
}
