import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState, PageHeader } from "@/components/layout/PageHeader";
import { isAdmin, signOut, updateProfile, useCurrentUser } from "@/data/auth";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — PAIE ROYALE" }, { name: "description", content: "Gestiona tus datos y preferencias en PAIE ROYALE." }, { property: "og:title", content: "Mi perfil — PAIE ROYALE" }, { property: "og:description", content: "Tu cuenta PAIE ROYALE." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.id]);

  if (!user)
    return <div className="mx-auto max-w-3xl px-6 py-16"><EmptyState icon={<LogIn className="h-6 w-6" />} title="Inicia sesión" description="Ingresa para ver y editar tu perfil." action={<Button asChild><Link to="/login" search={{ redirect: "/perfil" }}>Iniciar sesión</Link></Button>} /></div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <PageHeader eyebrow={isAdmin(user) ? "Administrador" : "Cliente"} title="Mi perfil" />
      <form
        className="mt-8 space-y-5 rounded-2xl border bg-card p-6 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 3) return toast.error("Escribe tu nombre completo.");
          updateProfile(user.id, { name: name.trim(), phone: phone.trim() || undefined });
          toast.success("Perfil actualizado");
        }}
      >
        <div className="space-y-1.5"><Label htmlFor="p-name">Nombre</Label><Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="p-email">Correo</Label><Input id="p-email" value={user.email} disabled /></div>
        <div className="space-y-1.5"><Label htmlFor="p-phone">Teléfono</Label><Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary p-4">
          <div><Label htmlFor="p-optin">Recibir promociones por correo</Label><p className="text-xs text-muted-foreground">Solo te escribiremos si lo activas.</p></div>
          <Switch id="p-optin" checked={user.promoOptIn} onCheckedChange={(v) => { updateProfile(user.id, { promoOptIn: v }); toast(v ? "Suscrito a promociones" : "Ya no recibirás promociones"); }} />
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <Button type="submit">Guardar cambios</Button>
          <Button type="button" variant="outline" onClick={() => { signOut(); toast.success("Sesión cerrada"); navigate({ to: "/" }); }}><LogOut /> Cerrar sesión</Button>
        </div>
      </form>
    </div>
  );
}
