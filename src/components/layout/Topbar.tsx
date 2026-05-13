import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";

export function Topbar() {
  const { location } = useRouterState();
  const mode: "b2g" | "b2b" =
    location.pathname.startsWith("/b2b") ? "b2b" : "b2g";

  return (
    <header className="h-12 shrink-0 border-b border-border bg-card flex items-center px-4 gap-4">
      <Link to="/dashboard" className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-md bg-accent-green text-black grid place-items-center font-bold text-sm">
          PS
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">PengadaanScope</div>
          <div className="text-[10px] text-muted-foreground">
            Intelijen Peluang Bisnis Nasional · TA 2026
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1 ml-6 bg-card-2 rounded-md p-0.5 border border-border">
        <Link
          to="/b2g"
          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
            mode === "b2g"
              ? "bg-accent-green text-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          B2G — Pemerintah
        </Link>
        <Link
          to="/b2b"
          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
            mode === "b2b"
              ? "bg-accent-teal text-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          B2B — Swasta
        </Link>
      </div>

      <nav className="flex items-center gap-1 ml-2 text-xs">
        {[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/watchlist", label: "Watchlist" },
          { to: "/analytics", label: "Analytics" },
          { to: "/settings", label: "Settings" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeProps={{ className: "text-foreground bg-card-2" }}
            className="px-3 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent-green-light">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green-light animate-pulse" />
          LIVE · 2026
        </span>
        <button className="text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-7 w-7 rounded-full bg-card-2 border border-border grid place-items-center">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
