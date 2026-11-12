import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { publicRooms, useRooms } from "@/data/repository";
import { bedTypeLabel, formatCOP } from "@/lib/format";
import { RoomCard } from "./RoomCard";
import { EmptyState } from "@/components/layout/PageHeader";

type Sort = "recomendado" | "precio-asc" | "precio-desc" | "capacidad";

export function RoomsCatalog() {
  const rooms = publicRooms(useRooms());
  const maxPrice = Math.max(...rooms.map((r) => r.pricePerNight), 500000);
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [bed, setBed] = useState("todas");
  const [price, setPrice] = useState<number>(maxPrice);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<Sort>("recomendado");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rooms.filter(
      (r) =>
        (!q || `${r.name} ${r.number} ${r.shortDescription} ${r.view}`.toLowerCase().includes(q)) &&
        r.capacity >= Number(capacity) &&
        (bed === "todas" || r.bedType === bed) &&
        r.pricePerNight <= price &&
        (!onlyAvailable || r.status === "disponible"),
    );
    const sorted = [...list];
    if (sort === "precio-asc") sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sort === "precio-desc") sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sort === "capacidad") sorted.sort((a, b) => b.capacity - a.capacity);
    if (sort === "recomendado") sorted.sort((a, b) => Number(b.status === "disponible") - Number(a.status === "disponible") || a.number.localeCompare(b.number));
    return sorted;
  }, [rooms, query, capacity, bed, price, onlyAvailable, sort]);

  const reset = () => {
    setQuery("");
    setCapacity("0");
    setBed("todas");
    setPrice(maxPrice);
    setOnlyAvailable(false);
    setSort("recomendado");
  };

  return (
    <div>
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft sm:p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4 text-gold" /> Filtrar habitaciones
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="room-search" className="text-xs text-muted-foreground">Buscar</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="room-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre, número o vista" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Capacidad</Label>
            <Select value={capacity} onValueChange={setCapacity}>
              <SelectTrigger aria-label="Capacidad"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Cualquiera</SelectItem>
                <SelectItem value="2">2+ personas</SelectItem>
                <SelectItem value="3">3+ personas</SelectItem>
                <SelectItem value="4">4+ personas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de cama</Label>
            <Select value={bed} onValueChange={setBed}>
              <SelectTrigger aria-label="Tipo de cama"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {Object.entries(bedTypeLabel).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Precio máximo: <span className="text-foreground">{formatCOP(price)}</span></Label>
            <Slider value={[price]} min={300000} max={maxPrice} step={50000} onValueChange={(v) => setPrice(v[0])} aria-label="Precio máximo por noche" className="pt-3" />
          </div>
          <div className="flex items-end gap-2 pb-1.5">
            <Switch id="only-available" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            <Label htmlFor="only-available" className="text-sm">Solo disponibles</Label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "habitación" : "habitaciones"}
        </p>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-48" aria-label="Ordenar"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recomendado">Recomendadas</SelectItem>
              <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="capacidad">Mayor capacidad</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup type="single" value={layout} onValueChange={(v) => v && setLayout(v as "grid" | "list")} variant="outline" size="sm">
            <ToggleGroupItem value="grid" aria-label="Vista en cuadrícula"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vista en lista"><List className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="Sin coincidencias"
            description="Ninguna habitación cumple estos filtros. Prueba ampliando el precio o la capacidad."
            action={<Button variant="outline" onClick={reset}>Limpiar filtros</Button>}
          />
        </div>
      ) : (
        <div className={`mt-6 grid gap-6 ${layout === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {filtered.map((r) => (
            <RoomCard key={r.id} room={r} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}
