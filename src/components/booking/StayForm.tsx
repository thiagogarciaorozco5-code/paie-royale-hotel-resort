import { CalendarIcon, Minus, Plus } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CHECK_IN_TIMES, CHECK_OUT_TIMES, addDays, dateToISO, isoToLocalDate, type StayErrors } from "@/lib/booking";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface StayValue {
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  adults: number;
  children: number;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  defaultMonth,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  disabled: (d: Date) => boolean;
  error?: string;
  defaultMonth?: Date;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn("w-full justify-start font-normal", !value && "text-muted-foreground", error && "border-destructive")}
          >
            <CalendarIcon className="text-gold" />
            {value ? formatDate(value) : "Elegir fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            selected={value ? isoToLocalDate(value) : undefined}
            defaultMonth={value ? isoToLocalDate(value) : defaultMonth}
            onSelect={(d) => {
              if (d) {
                onChange(dateToISO(d));
                setOpen(false);
              }
            }}
            disabled={disabled}
            className="pointer-events-auto p-3"
          />
        </PopoverContent>
      </Popover>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function TimeField({ id, label, value, options, onChange, error }: { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-invalid={!!error} className={cn(error && "border-destructive")}>
          <SelectValue placeholder="Hora" />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Menos ${label.toLowerCase()}`}>
          <Minus />
        </Button>
        <span className="w-5 text-center tabular-nums" aria-live="polite">{value}</span>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Más ${label.toLowerCase()}`}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export function StayForm({
  value,
  onChange,
  errors,
  capacity,
  occupied,
  today,
  fixedNights,
}: {
  value: StayValue;
  onChange: (patch: Partial<StayValue>) => void;
  errors: StayErrors;
  capacity: number;
  occupied: Set<string>;
  today: string;
  fixedNights?: number;
}) {
  const nightsFree = (from: string, nights: number) => {
    for (let i = 0; i < nights; i++) if (occupied.has(addDays(from, i))) return false;
    return true;
  };
  const firstBlockedAfter = (from: string) => {
    for (let i = 0; i < 31; i++) {
      const d = addDays(from, i);
      if (occupied.has(d)) return d;
    }
    return null;
  };

  const disableCheckIn = (d: Date) => {
    const iso = dateToISO(d);
    if (iso < today) return true;
    return !nightsFree(iso, fixedNights ?? 1);
  };
  const limit = value.checkInDate ? firstBlockedAfter(value.checkInDate) : null;
  const disableCheckOut = (d: Date) => {
    const iso = dateToISO(d);
    if (iso <= (value.checkInDate || today)) return true;
    if (limit && iso > limit) return true;
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DateField
          id="check-in-date"
          label="Llegada"
          value={value.checkInDate}
          error={errors.checkInDate}
          disabled={disableCheckIn}
          defaultMonth={isoToLocalDate(today)}
          onChange={(iso) => {
            const patch: Partial<StayValue> = { checkInDate: iso };
            if (fixedNights) patch.checkOutDate = addDays(iso, fixedNights);
            else if (!value.checkOutDate || value.checkOutDate <= iso) patch.checkOutDate = addDays(iso, 1);
            onChange(patch);
          }}
        />
        <TimeField id="check-in-time" label="Hora de llegada" value={value.checkInTime} options={CHECK_IN_TIMES} onChange={(v) => onChange({ checkInTime: v })} error={errors.checkInTime} />
        {fixedNights ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Salida</Label>
            <div className="flex h-9 items-center rounded-md border border-dashed px-3 text-sm text-muted-foreground">
              {value.checkOutDate ? formatDate(value.checkOutDate) : `${fixedNights} noches después`}
            </div>
            <FieldError id="check-out-date-error" message={errors.checkOutDate} />
          </div>
        ) : (
          <DateField
            id="check-out-date"
            label="Salida"
            value={value.checkOutDate}
            error={errors.checkOutDate}
            disabled={disableCheckOut}
            defaultMonth={value.checkInDate ? isoToLocalDate(value.checkInDate) : isoToLocalDate(today)}
            onChange={(iso) => onChange({ checkOutDate: iso })}
          />
        )}
        <TimeField id="check-out-time" label="Hora de salida" value={value.checkOutTime} options={CHECK_OUT_TIMES} onChange={(v) => onChange({ checkOutTime: v })} error={errors.checkOutTime} />
      </div>
      <p className="text-[0.7rem] text-muted-foreground">
        Horario de Colombia (America/Bogotá). Check-in 3:00 p. m. – 10:00 p. m. · Check-out 6:00 a. m. – 12:00 m.
      </p>
      <div className="rounded-xl border bg-background/60 px-4 py-1">
        <Stepper label="Adultos" hint="13 años o más" value={value.adults} min={1} max={capacity - value.children} onChange={(v) => onChange({ adults: v })} />
        <div className="border-t" />
        <Stepper label="Niños" hint="De 2 a 12 años" value={value.children} min={0} max={capacity - value.adults} onChange={(v) => onChange({ children: v })} />
      </div>
      <FieldError id="guests-error" message={errors.guests} />
      <p className="text-[0.7rem] text-muted-foreground">Capacidad máxima: {capacity} huéspedes.</p>
    </div>
  );
}
