import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Daftar — PengadaanScope" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cek email Anda untuk verifikasi");
    navigate({ to: "/auth/login" });
  }

  return (
    <AuthShell title="Buat akun" subtitle="Mulai pantau peluang pengadaan">
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-md bg-accent-green text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <div className="mt-4 text-xs text-muted-foreground">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="text-accent-green hover:underline">Masuk</Link>
      </div>
    </AuthShell>
  );
}
