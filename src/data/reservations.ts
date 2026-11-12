// Reservation creation + availability validation point.
//
// SERVER VALIDATION POINT: `assertRoomAvailable` is the single place where overlap is
// enforced before a reservation is written. When persistence moves to Lovable Cloud,
// move this into a server function that runs inside a DB transaction, backed by an
// exclusion constraint, e.g.:
//   ALTER TABLE reservations ADD CONSTRAINT no_overlap
//   EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, '[)') WITH &&)
//   WHERE (status <> 'cancelada');
import {
  computePricing,
  findConflict,
  generateBookingCode,
  isPromoValid,
  nightsBetween,
  todayInBogota,
  validateStay,
} from "@/lib/booking";
import { formatDate } from "@/lib/format";
import type { BookingDraft, PaymentMethod, PaymentStatus, PublicUser, Reservation } from "@/lib/types";
import { newId, packagesRepo, promotionsRepo, reservationsRepo, reservationsStore, roomsRepo, servicesRepo } from "./repository";

export class BookingError extends Error {}

export function resolveDraft(draft: BookingDraft) {
  const pkg = draft.kind === "paquete" ? packagesRepo.get(draft.itemId) : undefined;
  const room = roomsRepo.get(pkg ? pkg.roomId : draft.itemId);
  return { pkg, room };
}

export function priceDraft(draft: BookingDraft, today = todayInBogota()) {
  const { pkg, room } = resolveDraft(draft);
  const services = servicesRepo.list().filter((s) => draft.serviceIds.includes(s.id));
  const promo = draft.promoCode
    ? promotionsRepo.list().find((p) => p.code.toUpperCase() === draft.promoCode!.toUpperCase())
    : undefined;
  const validPromo = promo && isPromoValid(promo, draft.kind, today) ? promo : null;
  const nights = nightsBetween(draft.checkInDate, draft.checkOutDate);
  return computePricing({
    kind: draft.kind,
    itemName: pkg ? pkg.name : room ? `${room.name} · Hab. ${room.number}` : "—",
    nightlyPrice: room?.pricePerNight,
    packagePrice: pkg?.price,
    nights,
    guests: draft.adults + draft.children,
    services,
    promo: validPromo,
  });
}

export function assertRoomAvailable(roomId: string, from: string, to: string, excludeId?: string) {
  const room = roomsRepo.get(roomId);
  if (!room) throw new BookingError("La habitación no existe.");
  if (room.status !== "disponible") throw new BookingError("La habitación no está disponible para reservas en este momento.");
  const conflict = findConflict(roomId, from, to, reservationsStore.get(), room.blockedRanges, excludeId);
  if (conflict)
    throw new BookingError(
      `La habitación ${room.number} ya está ${conflict.type === "reserva" ? "reservada" : "bloqueada"} del ${formatDate(conflict.from)} al ${formatDate(conflict.to)}. Elige otras fechas.`,
    );
  return room;
}

export interface PaymentResult {
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
}

export async function createReservation(draft: BookingDraft, user: PublicUser, payment: PaymentResult): Promise<Reservation> {
  await new Promise((r) => setTimeout(r, 600));
  const { pkg, room } = resolveDraft(draft);
  if (!room) throw new BookingError("No encontramos la habitación seleccionada.");
  const errors = validateStay({ ...draft, capacity: pkg ? pkg.maxGuests : room.capacity });
  const first = Object.values(errors)[0];
  if (first) throw new BookingError(first);
  const unavailable = servicesRepo.list().filter((s) => draft.serviceIds.includes(s.id) && !s.available);
  if (unavailable.length) throw new BookingError(`El servicio "${unavailable[0].name}" ya no está disponible.`);

  assertRoomAvailable(room.id, draft.checkInDate, draft.checkOutDate);

  const reservation: Reservation = {
    id: newId("res"),
    code: generateBookingCode(),
    userId: user.id,
    guestName: user.name,
    guestEmail: user.email,
    kind: draft.kind,
    itemId: draft.itemId,
    itemName: pkg ? pkg.name : room.name,
    roomId: room.id,
    roomNumber: room.number,
    checkInDate: draft.checkInDate,
    checkInTime: draft.checkInTime,
    checkOutDate: draft.checkOutDate,
    checkOutTime: draft.checkOutTime,
    adults: draft.adults,
    children: draft.children,
    serviceIds: draft.serviceIds,
    promoCode: draft.promoCode,
    pricing: priceDraft(draft),
    paymentMethod: payment.method,
    paymentStatus: payment.status,
    paymentReference: payment.reference,
    status: payment.status === "aprobado_demo" ? "confirmada" : "pendiente",
    createdAt: new Date().toISOString(),
  };
  reservationsRepo.upsert(reservation);
  return reservation;
}

export function cancelReservation(id: string) {
  reservationsRepo.patch(id, { status: "cancelada" });
}
