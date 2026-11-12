import { createPersistentStore, useStore } from "./store";

export type FavoriteKind = "habitacion" | "paquete";
const favoritesStore = createPersistentStore<{ habitacion: string[]; paquete: string[] }>("pr:v1:favorites", () => ({
  habitacion: [],
  paquete: [],
}));

export function useFavorites() {
  return useStore(favoritesStore);
}

export function toggleFavorite(kind: FavoriteKind, id: string) {
  let added = false;
  favoritesStore.set((prev) => {
    const list = prev[kind];
    added = !list.includes(id);
    return { ...prev, [kind]: added ? [...list, id] : list.filter((x) => x !== id) };
  });
  return added;
}
