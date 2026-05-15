import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, LogIn, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    navigate({ to: "/auth/login" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-7 rounded-full bg-card-2 border border-border grid place-items-center hover:border-accent-green transition-colors">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Masuk sebagai</div>
              <div className="text-xs text-foreground truncate">{email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/team" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-3.5 w-3.5" /> Team
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-accent-red focus:text-accent-red">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Keluar
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/auth/login" className="flex items-center gap-2 cursor-pointer">
                <LogIn className="h-3.5 w-3.5" /> Masuk
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/auth/register" className="flex items-center gap-2 cursor-pointer">
                <UserPlus className="h-3.5 w-3.5" /> Daftar
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
