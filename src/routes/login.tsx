import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, safeRedirect } from "@/components/auth/AuthCard";
import { signIn } from "@/data/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (typeof s.redirect === "string" ? { redirect: s.redirect } : {}),
  head: () => ({ meta: [{ title: "Iniciar sesión — PAIE ROYALE" }, { name: "description", content: "Ingresa a tu cuenta PAIE ROYALE para confirmar y gestionar tus reservas." }, { property: "og:title", content: "Iniciar sesión — PAIE ROYALE" }, { property: "og:description", content: "Accede a tu cuenta." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !password) return setError("Escribe tu correo y contraseña.");
    setLoading(true);
    setError("");
    try {
      const u = await signIn(email, password);
      toast.success(`Bienvenido, ${u.name.split(" ")[0]}`);
      router.history.push(safeRedirect(redirect));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle={redirect === "/reservas" ? "Ingresa para confirmar tu reserva. Tu selección se conserva." : "Accede a tus reservas y favoritos."}
      footer={<>¿No tienes cuenta? <Link to="/registro" search={{ redirect }} className="text-primary underline-offset-4 hover:underline">Regístrate</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5"><Label htmlFor="email">Correo electrónico</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Contraseña</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}Ingresar</Button>
      </form>
      <div className="mt-5 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">Cuentas de demostración</div>
        Cliente: cliente@demo.co · Cliente123!<br />Administrador: admin@paieroyale.co · Admin123!
      </div>
    </AuthCard>
  );
}
