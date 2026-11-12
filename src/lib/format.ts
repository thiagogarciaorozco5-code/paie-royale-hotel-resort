const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number) {
  return cop.format(Math.round(value)).replace(/\u00a0/g, " ");
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** Format a YYYY-MM-DD string without timezone drift. */
export function formatDate(iso: string, long = false) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return long
    ? `${WEEKDAYS[wd]} ${d} de ${MONTHS_LONG[m - 1]} de ${y}`
    : `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatTime(t: string) {
  if (!t) return "—";
  const [h, min] = t.split(":").map(Number);
  const suffix = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export const bedTypeLabel: Record<string, string> = {
  king: "Cama king",
  queen: "Cama queen",
  doble: "Habitación doble",
  "dos-camas": "Dos camas",
  familiar: "Configuración familiar",
};

export const unitLabel: Record<string, string> = {
  persona: "por persona",
  estadia: "por estadía",
  noche: "por noche",
};

export const paymentMethodLabel: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

export const paymentStatusLabel: Record<string, string> = {
  pendiente_hotel: "Pago en el hotel",
  pendiente_verificacion: "Pendiente de verificación",
  aprobado_demo: "Aprobado (demo)",
  pagado: "Pagado",
  reembolsado: "Reembolsado",
};

export const reservationStatusLabel: Record<string, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  cancelada: "Cancelada",
  completada: "Completada",
};

export const roomStatusLabel: Record<string, string> = {
  disponible: "Disponible",
  mantenimiento: "En mantenimiento",
  inactiva: "Inactiva",
};
