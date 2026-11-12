import type { User } from "./types";

/** Promotion emails only ever target active users who opted in. */
export function campaignRecipients(users: Pick<User, "id" | "email" | "active" | "promoOptIn">[]) {
  return users.filter((u) => u.active && u.promoOptIn);
}
