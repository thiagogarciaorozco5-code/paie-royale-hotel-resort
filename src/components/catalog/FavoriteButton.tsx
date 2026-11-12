import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleFavorite, useFavorites, type FavoriteKind } from "@/data/favorites";

export function FavoriteButton({ kind, id, name, className }: { kind: FavoriteKind; id: string; name: string; className?: string }) {
  const favs = useFavorites();
  const active = favs[kind].includes(id);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleFavorite(kind, id);
        toast(added ? "Guardado en favoritos" : "Eliminado de favoritos", { description: name });
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition-all hover:scale-110",
        active && "text-destructive",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
