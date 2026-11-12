import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/PageHeader";
import { currentUser, isAdmin, useCurrentUser } from "@/data/auth";
import { cn } from "@/lib/utils";

// Demo guard (client-side). Real protection requires server-side role checks once
// Lovable Cloud auth + a user_roles table are enabled.
export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (!currentUser()) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  head: () => ({ meta: [{ title: "Panel administrativo — PAIE ROYALE" }, { name: "description", content: "Gestión de habitaciones, servicios, paquetes, promociones, reservas y usuarios." }, { name: "robots", content: "noindex" }, { property: "og:title", content: "Panel administrativo — PAIE ROYALE" }, { property: "og:description", content: "Área restringida." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Resumen", exact: true },
  { to: "/admin/habitaciones", label: "Habitaciones" },
  { to: "/admin/servicios", label: "Servicios" },
  { to: "/admin/paquetes", label: "Paquetes" },
  { to: "/admin/promociones", label: "Promociones" },
  { to: "/admin/reservas", label: "Reservas" },
  { to: "/admin/usuarios", label: "Usuarios" },
] as const;

function AdminLayout() {
  const user = useCurrentUser();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (!isAdmin(user))
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState icon={<ShieldAlert className="h-6 w-6" />} title="Acceso restringido" description="Esta sección es solo para administradores del hotel." action={<Button asChild><Link to="/">Volver al inicio</Link></Button>} />
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="eyebrow text-gold">Administración</div>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Panel PAIE ROYALE</h1>
      <nav aria-label="Secciones de administración" className="mt-6 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => {
          const active = "exact" in t ? pathname === t.to || pathname === "/admin/" : pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={cn("-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors", active ? "border-gold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}
