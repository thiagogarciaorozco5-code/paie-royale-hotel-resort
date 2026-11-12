// Pure booking rules: dates (America/Bogota), availability overlap and pricing.
// Shared by client validation and the reservation validation point in src/data/reservations.ts.
import type {
  BookingKind,
  DateRange,
  PriceBreakdown,
  Promotion,
  Reservation,
  Service,
} from "./types";

export const HOTEL_TZ = "America/Bogota";
export const BOGOTA_OFFSET = "-05:00"; // Colombia has no daylight saving time.
export const IVA_RATE = 0.19;
export const INSURANCE_PER_GUEST_NIGHT = 8500; // Seguro hotelero (demo value)
export const MAX_NIGHTS = 30;

export const CHECK_IN_TIMES = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
export const CHECK_OUT_TIMES = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"];

function bogotaParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HOTEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export function todayInBogota(now = new Date()) {
  return bogotaParts(now).date;
}

export function nowTimeInBogota(now = new Date()) {
  return bogotaParts(now).time;
}

/** Instant for a Bogota-local date + time. */
export function toInstant(date: string, time = "00:00") {
  return new Date(`${date}T${time}:00${BOGOTA_OFFSET}`);
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function nightsBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const utc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** Converts a JS Date picked in a calendar (local midnight) to YYYY-MM-DD. */
export function dateToISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function isoToLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface StayInput {
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  adults: number;
  children: number;
  capacity: number;
}

export type StayErrors = Partial<Record<"checkInDate" | "checkInTime" | "checkOutDate" | "checkOutTime" | "guests", string>>;

export function validateStay(input: StayInput, now = new Date()): StayErrors {
  const errors: StayErrors = {};
  const today = todayInBogota(now);

  if (!input.checkInDate) errors.checkInDate = "Selecciona la fecha de llegada.";
  else if (input.checkInDate < today) errors.checkInDate = "La fecha de llegada no puede estar en el pasado.";

  if (!input.checkInTime) errors.checkInTime = "Selecciona la hora de llegada.";
  else if (!CHECK_IN_TIMES.includes(input.checkInTime))
    errors.checkInTime = "El check-in es entre 3:00 p. m. y 10:00 p. m.";
  else if (input.checkInDate === today && input.checkInTime <= nowTimeInBogota(now))
    errors.checkInTime = "Esa hora ya pasó en Colombia. Elige una hora posterior.";

  if (!input.checkOutDate) errors.checkOutDate = "Selecciona la fecha de salida.";
  else if (input.checkInDate && input.checkOutDate === input.checkInDate)
    errors.checkOutDate = "La salida no puede ser el mismo día de la llegada.";
  else if (input.checkInDate && input.checkOutDate < input.checkInDate)
    errors.checkOutDate = "La salida debe ser posterior a la llegada.";
  else if (input.checkInDate && nightsBetween(input.checkInDate, input.checkOutDate) > MAX_NIGHTS)
    errors.checkOutDate = `La estadía máxima en línea es de ${MAX_NIGHTS} noches.`;

  if (!input.checkOutTime) errors.checkOutTime = "Selecciona la hora de salida.";
  else if (!CHECK_OUT_TIMES.includes(input.checkOutTime))
    errors.checkOutTime = "El check-out es entre 6:00 a. m. y 12:00 m.";

  const guests = input.adults + input.children;
  if (input.adults < 1) errors.guests = "Debe haber al menos un adulto.";
  else if (input.children < 0) errors.guests = "Número de niños no válido.";
  else if (guests > input.capacity)
    errors.guests = `La capacidad máxima es de ${input.capacity} ${input.capacity === 1 ? "huésped" : "huéspedes"}.`;

  return errors;
}

/** Half-open [from, to) ranges: checking out on a day frees it for a new check-in. */
export function rangesOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string) {
  return aFrom < bTo && bFrom < aTo;
}

export function findConflict(
  roomId: string,
  from: string,
  to: string,
  reservations: Pick<Reservation, "id" | "roomId" | "checkInDate" | "checkOutDate" | "status">[],
  blockedRanges: DateRange[] = [],
  excludeReservationId?: string,
): { type: "reserva" | "bloqueo"; from: string; to: string } | null {
  for (const r of reservations) {
    if (r.roomId !== roomId || r.status === "cancelada" || r.id === excludeReservationId) continue;
    if (rangesOverlap(from, to, r.checkInDate, r.checkOutDate))
      return { type: "reserva", from: r.checkInDate, to: r.checkOutDate };
  }
  for (const b of blockedRanges) {
    if (rangesOverlap(from, to, b.from, b.to)) return { type: "bloqueo", from: b.from, to: b.to };
  }
  return null;
}

/** Nights (YYYY-MM-DD) occupied for a room, for disabling calendar days. */
export function occupiedNights(
  roomId: string,
  reservations: Pick<Reservation, "roomId" | "checkInDate" | "checkOutDate" | "status">[],
  blockedRanges: DateRange[] = [],
) {
  const set = new Set<string>();
  const add = (from: string, to: string) => {
    for (let d = from; d < to; d = addDays(d, 1)) set.add(d);
  };
  reservations
    .filter((r) => r.roomId === roomId && r.status !== "cancelada")
    .forEach((r) => add(r.checkInDate, r.checkOutDate));
  blockedRanges.forEach((b) => add(b.from, b.to));
  return set;
}

export function canAddService(service: Pick<Service, "available">) {
  return service.available === true;
}

export function serviceAmount(service: Service, guests: number, nights: number) {
  if (service.unit === "persona") return service.price * guests;
  if (service.unit === "noche") return service.price * nights;
  return service.price;
}

export function isPromoValid(promo: Promotion, kind: BookingKind, today: string) {
  if (!promo.active) return false;
  if (promo.validUntil < today) return false;
  if (promo.appliesTo === "todo") return true;
  return (promo.appliesTo === "habitaciones" && kind === "habitacion") ||
    (promo.appliesTo === "paquetes" && kind === "paquete");
}

export interface PricingInput {
  kind: BookingKind;
  itemName: string;
  nightlyPrice?: number; // rooms
  packagePrice?: number; // packages
  nights: number;
  guests: number;
  services: Service[];
  promo?: Promotion | null;
}

export function computePricing(input: PricingInput): PriceBreakdown {
  const nights = Math.max(0, input.nights);
  const lodgingAmount =
    input.kind === "habitacion" ? (input.nightlyPrice ?? 0) * nights : (input.packagePrice ?? 0);
  const lodging = {
    label: input.itemName,
    detail:
      input.kind === "habitacion"
        ? `${nights} ${nights === 1 ? "noche" : "noches"}`
        : `Paquete · ${nights} ${nights === 1 ? "noche" : "noches"}`,
    amount: lodgingAmount,
  };
  // Only available services are ever billed.
  const services = input.services.filter(canAddService).map((s) => ({
    label: s.name,
    detail:
      s.unit === "persona"
        ? `${input.guests} × persona`
        : s.unit === "noche"
          ? `${nights} × noche`
          : "por estadía",
    amount: serviceAmount(s, input.guests, nights),
  }));
  const subtotal = lodgingAmount + services.reduce((a, s) => a + s.amount, 0);
  const discount = input.promo ? Math.round((subtotal * input.promo.discountPercent) / 100) : 0;
  const taxableBase = subtotal - discount;
  const iva = Math.round(taxableBase * IVA_RATE);
  const insurance = INSURANCE_PER_GUEST_NIGHT * input.guests * nights;
  return {
    nights,
    lodging,
    services,
    subtotal,
    discount,
    discountLabel: input.promo ? `${input.promo.code} (−${input.promo.discountPercent}%)` : undefined,
    taxableBase,
    iva,
    insurance,
    total: taxableBase + iva + insurance,
  };
}

export function generateBookingCode(random = Math.random) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(random() * alphabet.length)];
  return `PR-${s}`;
}

// ---- Card helpers (demo only: card data is never stored) ----
export function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
export function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
export function luhnValid(num: string) {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}
export function cardBrand(num: string) {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "American Express";
  return "Tarjeta";
}
export function expiryValid(exp: string, today: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const [ty, tm] = today.split("-").map(Number);
  return year > ty || (year === ty && month >= tm);
}
