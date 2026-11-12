import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { computePricing, findConflict, nightsBetween, occupiedNights, todayInBogota, validateStay, type StayErrors } from "@/lib/booking";
import { formatDate } from "@/lib/format";
import type { BookingKind, Service } from "@/lib/types";
import { setDraft, useDraft } from "@/data/draft";
import { useReservations, useRooms, useServices } from "@/data/repository";
import type { StayValue } from "./StayForm";

export function useBookingConfig(opts: {
  kind: BookingKind;
  itemId: string;
  itemName: string;
  roomId: string;
  capacity: number;
  nightlyPrice?: number;
  packagePrice?: number;
  fixedNights?: number;
  serviceIds?: string[]; // services offered on this screen (defaults to all)
}) {
  const draft = useDraft();
  const navigate = useNavigate();
  const rooms = useRooms();
  const reservations = useReservations();
  const allServices = useServices();
  const today = todayInBogota();
  const fromDraft = draft && draft.kind === opts.kind && draft.itemId === opts.itemId ? draft : null;

  const [stay, setStay] = useState<StayValue>(() => ({
    checkInDate: fromDraft?.checkInDate ?? "",
    checkInTime: fromDraft?.checkInTime ?? "15:00",
    checkOutDate: fromDraft?.checkOutDate ?? "",
    checkOutTime: fromDraft?.checkOutTime ?? "12:00",
    adults: fromDraft?.adults ?? Math.min(2, opts.capacity),
    children: fromDraft?.children ?? 0,
  }));
  const [serviceIds, setServiceIds] = useState<string[]>(fromDraft?.serviceIds ?? []);
  const [showErrors, setShowErrors] = useState(false);

  const room = rooms.find((r) => r.id === opts.roomId);
  const occupied = useMemo(
    () => occupiedNights(opts.roomId, reservations, room?.blockedRanges ?? []),
    [opts.roomId, reservations, room?.blockedRanges],
  );

  const services: Service[] = opts.serviceIds
    ? opts.serviceIds.map((id) => allServices.find((s) => s.id === id)).filter((s): s is Service => !!s)
    : allServices;

  const errors: StayErrors = useMemo(() => {
    const e = validateStay({ ...stay, capacity: opts.capacity });
    if (!e.checkInDate && !e.checkOutDate && stay.checkInDate && stay.checkOutDate) {
      if (room && room.status !== "disponible") e.checkInDate = "Esta habitación no está disponible para reservas por ahora.";
      const c = findConflict(opts.roomId, stay.checkInDate, stay.checkOutDate, reservations, room?.blockedRanges ?? []);
      if (c) e.checkOutDate = `No disponible: ocupada del ${formatDate(c.from)} al ${formatDate(c.to)}.`;
    }
    return e;
  }, [stay, opts.capacity, opts.roomId, reservations, room]);

  const nights = nightsBetween(stay.checkInDate, stay.checkOutDate);
  const selectedServices = allServices.filter((s) => serviceIds.includes(s.id) && s.available);
  const pricing = computePricing({
    kind: opts.kind,
    itemName: opts.itemName,
    nightlyPrice: opts.nightlyPrice,
    packagePrice: opts.packagePrice,
    nights: opts.kind === "paquete" ? opts.fixedNights ?? nights : Math.max(nights, 0),
    guests: stay.adults + stay.children,
    services: selectedServices,
  });
  const hasDates = !!stay.checkInDate && !!stay.checkOutDate && nights > 0;

  const toggleService = (id: string) => {
    const s = allServices.find((x) => x.id === id);
    if (!s?.available) return; // never selectable when unavailable
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const proceed = () => {
    setShowErrors(true);
    const first = Object.values(errors)[0];
    if (first) {
      toast.error("Revisa tu estadía", { description: first });
      return;
    }
    setDraft({
      kind: opts.kind,
      itemId: opts.itemId,
      ...stay,
      serviceIds: selectedServices.map((s) => s.id),
      promoCode: draft?.promoCode,
      paymentMethod: draft?.paymentMethod,
    });
    navigate({ to: "/reservas", search: { tab: "nueva" } });
  };

  return {
    stay,
    patchStay: (p: Partial<StayValue>) => setStay((s) => ({ ...s, ...p })),
    errors: showErrors ? errors : ({} as StayErrors),
    occupied,
    today,
    services,
    serviceIds,
    toggleService,
    pricing,
    hasDates,
    proceed,
  };
}
