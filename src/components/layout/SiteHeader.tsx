import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, CircleHelp, LayoutDashboard, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoMark } from "@/components/brand/LogoMark";
import { isAdmin, signOut, useCurrentUser } from "@/data/auth";
import { toast } from "sonner";

export function SiteHeader() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const initials = user?.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="text-foreground" aria-label="Abrir o cerrar menú" />
      <Link to="/" className="flex items-center gap-2 md:hidden" aria-label="PAIE ROYALE inicio">
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-base font-semibold tracking-[0.18em]">PAIE ROYALE</span>
      </Link>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/ayuda">
            <CircleHelp />
            <span className="hidden sm:inline">Ayuda</span>
          </Link>
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 pl-1.5" aria-label="Menú de cuenta">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden max-w-32 truncate sm:inline">{user.name.split(" ")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email} · {isAdmin(user) ? "Administrador" : "Cliente"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil"><User /> Mi perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reservas" search={{ tab: "mis-reservas" }}>
                  <CalendarCheck /> Mis reservas
                </Link>
              </DropdownMenuItem>
              {isAdmin(user) && (
                <DropdownMenuItem asChild>
                  <Link to="/admin"><LayoutDashboard /> Panel administrativo</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  signOut();
                  toast.success("Sesión cerrada");
                  navigate({ to: "/" });
                }}
              >
                <LogOut /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link to="/login" search={{ redirect: undefined }}>Iniciar sesión</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
