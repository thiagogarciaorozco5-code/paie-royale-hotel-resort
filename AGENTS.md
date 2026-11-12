<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- All UI data reads/writes go through `src/data/*` (repository, auth, draft, favorites, reservations); today they are localStorage stores seeded from `src/data/seed.ts`. Why: persistence can be swapped to Lovable Cloud tables without touching pages.
- Booking rules (Bogotá dates, overlap, pricing, card helpers) live as pure functions in `src/lib/booking.ts` with tests in `src/lib/booking.test.ts`. Why: one source of truth for client checks and the reservation validation point.
- `assertRoomAvailable` in `src/data/reservations.ts` is the single overlap enforcement point before writing a reservation. Why: it is where a server function + DB exclusion constraint must replace the client check.
- Stored records reference bundled images as `asset:<key>` resolved by `img()` in `src/data/images.ts`. Why: persisted data survives asset hash changes.
- Date/guest selectors live only inside room/package detail pages, never on home or header. Why: explicit product requirement.
- tsconfig keeps `strict` but disables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature`. Why: they added noise across shadcn-style optional props without catching real bugs here.
