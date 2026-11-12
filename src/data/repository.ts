// Data access layer. Every read/write in the UI goes through this module.
// Today it is backed by localStorage stores seeded with demo data; to persist in
// Lovable Cloud, replace each store with table queries keeping the same functions.
import { createPersistentStore, useStore, type PersistentStore } from "./store";
import { seedPackages, seedPromotions, seedReservations, seedRooms, seedServices, seedUsers } from "./seed";
import type { EmailCampaign, Package, Promotion, Reservation, Room, Service, User } from "@/lib/types";

const V = "pr:v1";

export const roomsStore = createPersistentStore<Room[]>(`${V}:rooms`, () => seedRooms);
export const servicesStore = createPersistentStore<Service[]>(`${V}:services`, () => seedServices);
export const packagesStore = createPersistentStore<Package[]>(`${V}:packages`, () => seedPackages);
export const promotionsStore = createPersistentStore<Promotion[]>(`${V}:promotions`, () => seedPromotions());
export const reservationsStore = createPersistentStore<Reservation[]>(`${V}:reservations`, () => seedReservations());
export const usersStore = createPersistentStore<User[]>(`${V}:users`, () => seedUsers);
export const campaignsStore = createPersistentStore<EmailCampaign[]>(`${V}:campaigns`, () => []);

function crud<T extends { id: string }>(store: PersistentStore<T[]>) {
  return {
    list: () => store.get(),
    get: (id: string) => store.get().find((x) => x.id === id),
    upsert: (item: T) =>
      store.set((prev) => (prev.some((x) => x.id === item.id) ? prev.map((x) => (x.id === item.id ? item : x)) : [item, ...prev])),
    patch: (id: string, patch: Partial<T>) => store.set((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id: string) => store.set((prev) => prev.filter((x) => x.id !== id)),
  };
}

export const roomsRepo = crud(roomsStore);
export const servicesRepo = crud(servicesStore);
export const packagesRepo = crud(packagesStore);
export const promotionsRepo = crud(promotionsStore);
export const reservationsRepo = crud(reservationsStore);
export const usersRepo = crud(usersStore);
export const campaignsRepo = crud(campaignsStore);

export const useRooms = () => useStore(roomsStore);
export const useServices = () => useStore(servicesStore);
export const usePackages = () => useStore(packagesStore);
export const usePromotions = () => useStore(promotionsStore);
export const useReservations = () => useStore(reservationsStore);
export const useUsers = () => useStore(usersStore);
export const useCampaigns = () => useStore(campaignsStore);

export const publicRooms = (rooms: Room[]) => rooms.filter((r) => r.status !== "inactiva");
export const publicPackages = (pkgs: Package[]) => pkgs.filter((p) => p.active);

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function resetDemoData() {
  [roomsStore, servicesStore, packagesStore, promotionsStore, reservationsStore, usersStore, campaignsStore].forEach((s) =>
    (s as PersistentStore<unknown>).reset(),
  );
}
