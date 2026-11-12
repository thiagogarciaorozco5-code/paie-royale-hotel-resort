// The booking draft survives navigation and login (localStorage).
import { createPersistentStore, useStore } from "./store";
import type { BookingDraft } from "@/lib/types";

export const draftStore = createPersistentStore<BookingDraft | null>("pr:v1:draft", () => null);

export const useDraft = () => useStore(draftStore);
export const setDraft = (d: BookingDraft | null) => draftStore.set(d);
export const patchDraft = (p: Partial<BookingDraft>) => draftStore.set((prev) => (prev ? { ...prev, ...p } : prev));
export const clearDraft = () => draftStore.set(null);
