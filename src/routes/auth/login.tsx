import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Masuk — PengadaanScope" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil masuk");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Masuk" subtitle="Akses dashboard intelijen pengadaan">
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-md bg-accent-green text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <Link to="/auth/forgot-password" className="hover:text-foreground">Lupa password?</Link>
        <Link to="/auth/register" className="hover:text-foreground">Daftar akun</Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 mb-5">
          <div className="h-7 w-7 rounded-md bg-accent-green text-black grid place-items-center font-bold text-sm">PS</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">PengadaanScope</div>
            <div className="text-[10px] text-muted-foreground">Intelijen Peluang Bisnis Nasional</div>
          </div>
        </Link>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label, type = "text", value, onChange, required, autoComplete,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="mt-1 w-full h-9 rounded-md bg-card-2 border border-border px-3 text-sm text-foreground focus:outline-none focus:border-accent-green"
      />
    </label>
  );
}
