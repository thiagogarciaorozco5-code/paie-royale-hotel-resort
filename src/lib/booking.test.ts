import { describe, expect, it } from "vitest";
import {
  computePricing,
  findConflict,
  isPromoValid,
  luhnValid,
  nightsBetween,
  todayInBogota,
  validateStay,
} from "./booking";
import { buildNewClient } from "@/data/auth";
import type { Promotion, Service } from "./types";

// 2026-11-12 03:00 UTC is 2026-11-11 22:00 in Bogotá (UTC-5).
const NOW = new Date("2026-11-12T03:00:00Z");
const base = { checkInTime: "15:00", checkOutTime: "12:00", adults: 2, children: 0, capacity: 2 };

describe("fechas en America/Bogota", () => {
  it("usa la fecha de Bogotá, no la UTC", () => {
    expect(todayInBogota(NOW)).toBe("2026-11-11");
  });
  it("rechaza fechas pasadas", () => {
    const e = validateStay({ ...base, checkInDate: "2026-11-10", checkOutDate: "2026-11-13" }, NOW);
    expect(e.checkInDate).toBeDefined();
  });
  it("rechaza salida el mismo día de la llegada", () => {
    const e = validateStay({ ...base, checkInDate: "2026-11-20", checkOutDate: "2026-11-20" }, NOW);
    expect(e.checkOutDate).toMatch(/mismo día/);
  });
  it("rechaza salida antes de la llegada", () => {
    const e = validateStay({ ...base, checkInDate: "2026-11-20", checkOutDate: "2026-11-18" }, NOW);
    expect(e.checkOutDate).toBeDefined();
  });
  it("rechaza horas fuera de la ventana del hotel", () => {
    const e = validateStay({ ...base, checkInDate: "2026-11-20", checkOutDate: "2026-11-22", checkInTime: "09:00", checkOutTime: "18:00" }, NOW);
    expect(e.checkInTime).toBeDefined();
    expect(e.checkOutTime).toBeDefined();
  });
  it("rechaza una hora de llegada ya pasada hoy en Bogotá", () => {
    const e = validateStay({ ...base, checkInDate: "2026-11-11", checkOutDate: "2026-11-12", checkInTime: "21:00" }, NOW);
    expect(e.checkInTime).toBeDefined();
  });
  it("rechaza más huéspedes que la capacidad", () => {
    const e = validateStay({ ...base, adults: 2, children: 1, checkInDate: "2026-11-20", checkOutDate: "2026-11-22" }, NOW);
    expect(e.guests).toBeDefined();
  });
  it("acepta una estadía válida", () => {
    expect(validateStay({ ...base, checkInDate: "2026-11-20", checkOutDate: "2026-11-22" }, NOW)).toEqual({});
  });
  it("cuenta noches entre meses", () => {
    expect(nightsBetween("2026-01-31", "2026-02-02")).toBe(2);
  });
});

describe("solapamiento de reservas por habitación", () => {
  const existing = [{ id: "r1", roomId: "hab-101", checkInDate: "2026-11-20", checkOutDate: "2026-11-23", status: "confirmada" as const }];
  it("detecta solapamiento en la misma habitación", () => {
    expect(findConflict("hab-101", "2026-11-22", "2026-11-25", existing)).not.toBeNull();
  });
  it("permite entrar el día que otro huésped sale", () => {
    expect(findConflict("hab-101", "2026-11-23", "2026-11-25", existing)).toBeNull();
  });
  it("no bloquea otra habitación", () => {
    expect(findConflict("hab-102", "2026-11-21", "2026-11-22", existing)).toBeNull();
  });
  it("ignora reservas canceladas", () => {
    expect(findConflict("hab-101", "2026-11-21", "2026-11-22", [{ ...existing[0], status: "cancelada" }])).toBeNull();
  });
});

describe("precios", () => {
  const breakfast: Service = { id: "s1", name: "Desayuno", description: "", price: 65000, unit: "persona", available: true, icon: "coffee" };
  const roomService: Service = { ...breakfast, id: "s2", name: "Room service", unit: "noche", price: 90000, available: false };
  it("calcula alojamiento, servicios, IVA 19% y seguro hotelero", () => {
    const p = computePricing({ kind: "habitacion", itemName: "101", nightlyPrice: 450000, nights: 2, guests: 2, services: [breakfast] });
    expect(p.subtotal).toBe(900000 + 130000);
    expect(p.iva).toBe(Math.round(1030000 * 0.19));
    expect(p.insurance).toBe(8500 * 2 * 2);
    expect(p.total).toBe(1030000 + 195700 + 34000);
  });
  it("nunca cobra servicios no disponibles", () => {
    const p = computePricing({ kind: "habitacion", itemName: "101", nightlyPrice: 450000, nights: 1, guests: 2, services: [roomService] });
    expect(p.services).toHaveLength(0);
    expect(p.subtotal).toBe(450000);
  });
  it("aplica descuento antes del IVA", () => {
    const promo = { discountPercent: 15, code: "ROYALE15" } as Promotion;
    const p = computePricing({ kind: "habitacion", itemName: "101", nightlyPrice: 400000, nights: 1, guests: 1, services: [], promo });
    expect(p.discount).toBe(60000);
    expect(p.iva).toBe(Math.round(340000 * 0.19));
  });
  it("una promoción vencida o de otra categoría no aplica", () => {
    const promo = { active: true, validUntil: "2026-11-01", appliesTo: "todo" } as Promotion;
    expect(isPromoValid(promo, "habitacion", "2026-11-11")).toBe(false);
    expect(isPromoValid({ ...promo, validUntil: "2026-12-01", appliesTo: "paquetes" }, "habitacion", "2026-11-11")).toBe(false);
  });
});

describe("registro y pagos", () => {
  it("el registro público siempre crea un Cliente", () => {
    const u = buildNewClient(
      { name: "Ana", email: "ANA@x.co", password: "x", promoOptIn: false, ...({ role: "administrador" } as object) },
      "h",
      "id",
      NOW,
    );
    expect(u.role).toBe("cliente");
  });
  it("valida números de tarjeta con Luhn", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4242 4242 4242 4241")).toBe(false);
  });
});
