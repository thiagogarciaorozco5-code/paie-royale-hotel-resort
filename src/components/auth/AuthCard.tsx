import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/LogoMark";
import { siteConfig } from "@/config/site";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-12">
      <div className="rounded-2xl border bg-card p-7 shadow-lift">
        <LogoMark className="h-12 w-12" />
        <h1 className="mt-4 font-display text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={() =>
            toast.info("Google aún no está configurado", { description: "El acceso con Google se activará cuando se configuren las credenciales." })
          }
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22ZM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z" /></svg>
          Continuar con Google
          {!siteConfig.integrations.googleOAuth && <span className="text-[0.65rem] text-muted-foreground">(pendiente)</span>}
        </Button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />o con tu correo<div className="h-px flex-1 bg-border" /></div>
        {children}
      </div>
      <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}

export function safeRedirect(r: string | undefined) {
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/";
}
