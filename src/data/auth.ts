// Demo authentication (localStorage). Designed to be swapped for Lovable Cloud auth:
// keep the same exported functions and replace their bodies.
// NOTE: client-side demo auth is NOT a security boundary.
import { createPersistentStore, useStore } from "./store";
import { newId, usersRepo, usersStore } from "./repository";
import type { PublicUser, User } from "@/lib/types";

const sessionStore = createPersistentStore<{ userId: string | null }>("pr:v1:session", () => ({ userId: null }));

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`paie-royale:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toPublic(u: User): PublicUser {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}

export function currentUser(): PublicUser | null {
  const { userId } = sessionStore.get();
  const u = userId ? usersStore.get().find((x) => x.id === userId && x.active) : undefined;
  return u ? toPublic(u) : null;
}

export function useCurrentUser(): PublicUser | null {
  const { userId } = useStore(sessionStore);
  const users = useStore(usersStore);
  const u = userId ? users.find((x) => x.id === userId && x.active) : undefined;
  return u ? toPublic(u) : null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function signIn(email: string, password: string): Promise<PublicUser> {
  await delay(450);
  const u = usersStore.get().find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.passwordHash !== (await hashPassword(password))) throw new Error("Correo o contraseña incorrectos.");
  if (!u.active) throw new Error("Tu cuenta está desactivada. Contacta al hotel.");
  sessionStore.set({ userId: u.id });
  return toPublic(u);
}

export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  promoOptIn: boolean;
}

/** Public registration ALWAYS creates a Cliente — role is never taken from input. */
export function buildNewClient(input: SignUpInput, passwordHash: string, id: string, now: Date): User {
  return {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    passwordHash,
    role: "cliente",
    active: true,
    promoOptIn: input.promoOptIn,
    createdAt: now.toISOString(),
  };
}

export async function signUp(input: SignUpInput): Promise<PublicUser> {
  await delay(500);
  const email = input.email.trim().toLowerCase();
  if (usersStore.get().some((x) => x.email.toLowerCase() === email)) throw new Error("Ya existe una cuenta con ese correo.");
  const user = buildNewClient(input, await hashPassword(input.password), newId("usr"), new Date());
  usersRepo.upsert(user);
  sessionStore.set({ userId: user.id });
  return toPublic(user);
}

export function signOut() {
  sessionStore.set({ userId: null });
}

export function updateProfile(id: string, patch: Partial<Pick<User, "name" | "phone" | "promoOptIn">>) {
  usersRepo.patch(id, patch);
}

export function isAdmin(u: PublicUser | null) {
  return u?.role === "administrador";
}
