import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, safeRedirect } from "@/components/auth/AuthCard";
import { signUp } from "@/data/auth";

export const Route = createFileRoute("/registro")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (typeof s.redirect === "string" ? { redirect: s.redirect } : {}),
  head: () => ({ meta: [{ title: "Crear cuenta — PAIE ROYALE" }, { name: "description", content: "Crea tu cuenta de cliente en PAIE ROYALE para reservar en línea." }, { property: "og:title", content: "Crear cuenta — PAIE ROYALE" }, { property: "og:description", content: "Regístrate como cliente." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: RegisterPage,
});

type Errors = Partial<Record<"name" | "email" | "password" | "confirm", string>>;

function RegisterPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "", promoOptIn: false });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (f.name.trim().length < 3) er.name = "Escribe tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = "Correo no válido.";
    if (f.password.length < 8) er.password = "Mínimo 8 caracteres.";
    if (f.confirm !== f.password) er.confirm = "Las contraseñas no coinciden.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setFormError("");
    try {
      await signUp({ name: f.name, email: f.email, phone: f.phone, password: f.password, promoOptIn: f.promoOptIn });
      toast.success("Cuenta creada", { description: "Bienvenido a PAIE ROYALE" });
      router.history.push(safeRedirect(redirect));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const field = (id: keyof Errors | "phone", label: string, type = "text", auto?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} autoComplete={auto} value={f[id]} onChange={(e) => setF({ ...f, [id]: e.target.value })} aria-invalid={!!errors[id as keyof Errors]} />
      {errors[id as keyof Errors] && <p className="text-xs text-destructive">{errors[id as keyof Errors]}</p>}
    </div>
  );

  return (
    <AuthCard title="Crear cuenta" subtitle="Las cuentas nuevas se crean como Cliente." footer={<>¿Ya tienes cuenta? <Link to="/login" search={{ redirect }} className="text-primary underline-offset-4 hover:underline">Inicia sesión</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field("name", "Nombre completo", "text", "name")}
        {field("email", "Correo electrónico", "email", "email")}
        {field("phone", "Teléfono (opcional)", "tel", "tel")}
        {field("password", "Contraseña", "password", "new-password")}
        {field("confirm", "Confirmar contraseña", "password", "new-password")}
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={f.promoOptIn} onCheckedChange={(v) => setF({ ...f, promoOptIn: v === true })} className="mt-0.5" />
          Quiero recibir promociones por correo electrónico.
        </label>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}Crear cuenta</Button>
      </form>
    </AuthCard>
  );
}
