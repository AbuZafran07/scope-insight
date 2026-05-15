import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Lupa Password — PengadaanScope" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tautan reset dikirim ke email Anda");
  }

  return (
    <AuthShell title="Lupa password" subtitle="Kami kirim tautan reset ke email Anda">
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-md bg-accent-green text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim tautan reset"}
        </button>
      </form>
      <div className="mt-4 text-xs text-muted-foreground">
        <Link to="/auth/login" className="hover:text-foreground">← Kembali ke login</Link>
      </div>
    </AuthShell>
  );
}
