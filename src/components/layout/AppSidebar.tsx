import { Link, useRouterState } from "@tanstack/react-router";
import { BedDouble, CalendarCheck, Gift, Heart, Tag } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/brand/LogoMark";
import { useFavorites } from "@/data/favorites";
import { useDraft } from "@/data/draft";
import { siteConfig } from "@/config/site";

const items = [
  { title: "Habitaciones", url: "/habitaciones", icon: BedDouble, match: (p: string) => p === "/" || p.startsWith("/habitaciones") },
  { title: "Paquetes", url: "/paquetes", icon: Gift, match: (p: string) => p.startsWith("/paquetes") },
  { title: "Reservas", url: "/reservas", icon: CalendarCheck, match: (p: string) => p.startsWith("/reservas") },
  { title: "Favoritos", url: "/favoritos", icon: Heart, match: (p: string) => p.startsWith("/favoritos") },
  { title: "Promociones", url: "/promociones", icon: Tag, match: (p: string) => p.startsWith("/promociones") },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const favs = useFavorites();
  const draft = useDraft();
  const favCount = favs.habitacion.length + favs.paquete.length;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-3 pt-5 pb-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpenMobile(false)} aria-label="PAIE ROYALE inicio">
          <LogoMark className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <div className="leading-none">
              <div className="font-display text-lg font-semibold tracking-[0.2em] text-sidebar-accent-foreground">PAIE ROYALE</div>
              <div className="eyebrow mt-1 text-[0.55rem] text-gold">Hotel &amp; Resort</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <div className="mx-4 gold-rule opacity-40" />
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="eyebrow text-[0.6rem] text-sidebar-foreground/50">Explorar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = item.match(pathname);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-10 data-[active=true]:bg-sidebar-accent data-[active=true]:text-gold"
                    >
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span className="text-[0.95rem]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.title === "Favoritos" && favCount > 0 && (
                      <SidebarMenuBadge className="text-gold">{favCount}</SidebarMenuBadge>
                    )}
                    {item.title === "Reservas" && draft && (
                      <SidebarMenuBadge className="text-gold" aria-label="Reserva en curso">●</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter className="px-4 pb-5">
          <div className="rounded-lg border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
            <div className="eyebrow text-[0.55rem] text-gold">Ubicación</div>
            <p className="mt-1">{siteConfig.location}</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
