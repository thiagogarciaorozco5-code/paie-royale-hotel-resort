# Paie Royale Hotel & Resort

Build PAIE ROYALE, a polished Spanish-language hotel booking web app for a Colombian luxury hotel/resort. This is a real interactive full-stack application, not just a static landing page. Use the default Lovable stack (React + TypeScript + Tailwind + shadcn/ui) and structure data access cleanly so a database can be connected. Do not claim MySQL: Lovable cloud database is PostgreSQL/Supabase if enabled. Start by building the complete customer-facing experience with realistic seeded demo data and working client-side flows; keep components modular and make the app ready for persistence/auth integration.

VISUAL DIRECTION
- Luxury, elegant, modern hospitality; warm ivory/cream surfaces, deep forest/olive green, muted gold accents, dark charcoal text; premium serif display headings paired with clean sans-serif body.
- Beautiful hotel photography, generous whitespace, refined cards, subtle motion, responsive desktop/tablet/mobile. Avoid clutter and oversized controls.
- Brand: PAIE ROYALE — HOTEL & RESORT.
- Create a tasteful intro/brand animation on first entry (logo mark then PAIE ROYALE letters reveal, short line “Lujo, naturaleza y experiencias inolvidables”), with skip/reduced-motion support and no long blocking splash.
- No generic travel-site top booking bar. IMPORTANT: do NOT put dates, check-in/out, or guest selectors at the top/home page. Dates and guests are selected only after opening a room/package detail.

NAVIGATION / CUSTOMER EXPERIENCE
- Main app shell with a left sidebar on desktop (collapsible on mobile) containing exactly the primary sections: Habitaciones, Paquetes, Reservas, Favoritos, Promociones. The central content changes when selected. Top header may show brand, profile/login and help, but not date/guest booking fields.
- Guests can browse all public rooms, packages, services and promotions without signing in. Do not gate catalog pages behind login.
- Habitaciones page: responsive grid/list of attractive room cards with image, name/number (include Habitación 101), short description, bed type, capacity, nightly price, and status. Add useful filters (capacity, bed type, price, availability) and search/sort. Card actions: “Ver detalles” and favorite heart.
- Clicking “Ver detalles” opens a full room detail page/drawer with image gallery, room number, full description, bed configuration (e.g. habitación doble, dos camas, cama king as appropriate), capacity, amenities, bathroom, policies, price per night, and availability. ONLY HERE show date/guest controls: check-in date + time, check-out date + time, number of adults/children. Validate no past dates, checkout after check-in, not same day, valid hotel time windows, and show clear Spanish errors. Use America/Bogota for date/time interpretation.
- On the same room detail screen show “Servicios disponibles para tu estadía” as selectable service cards. Available services are visually GREEN with clear “Disponible” status and enabled add control. Unavailable services are DARK/MUTED with “No disponible” and disabled add control. Show service price and whether per person/per stay. Examples: desayuno, spa, transporte, restaurante/room service. Adding/removing services updates the summary/total.
- After selecting dates/guests and optional services, clicking “Continuar a reserva” automatically navigates to Reservas with room, dates, guests and selected services already carried over. Do not ask the customer to reselect them.
- Paquetes page: browse package cards with photo, name, price, included experiences/services, duration and “Ver detalles”. Package details allow date/guest selection there (not on home), display included items and optional extras, and then “Continuar a reserva” sends configured package to Reservas.
- Reservas page: reservation summary with selected room/package, dates/times, guest count, selected services, itemized subtotal, taxes/fees clearly identified and total. Allow editing/removing items and going back to catalog. Provide payment methods: Efectivo, Transferencia, Tarjeta. For transfer show bank/payment instructions and reference upload placeholder; cash option with pay-at-hotel status; card form with formatted number/expiry/CVV inputs and safe demo-only processing (never store card number/CVV). Require sign-in/register only when user confirms booking/payment; retain booking draft through login. On confirmation show booking code, payment state, detailed receipt and actions to print/download/email (demo UI if email service not configured).
- Reservations section also lists the signed-in user's upcoming/past bookings with details and status. Clearly distinguish “Nueva reserva” from “Mis reservas”.
- Favoritos: save/unsave rooms and packages; persist in local storage for demo and design clean empty state.
- Promociones: browse promotions, terms and expiry.
- Login/register pages with roles only Cliente and Administrador; public registration always creates Cliente. Do not expose admin role selection in signup. Include Google sign-in button UI but clearly configure real OAuth only when credentials are supplied.
- Profile/account page and logout.
- WhatsApp floating support button bottom-right with configurable link; social links in footer configurable.

ADMIN
- Protected admin area/dashboard with summary cards and management screens for rooms, services, packages, promotions, reservations and users. Only admin role may access; client cannot access admin routes. Include create/edit/deactivate/delete forms, image upload UI, availability management, and promotion email opt-in controls. For demo, use seeded data and clear architecture for persistence.
- Promotions email must only target users who opted in. Do not fake successful email delivery; label integration as pending until provider configured.

BUSINESS RULES / QUALITY
- Demo seed catalog includes room 101 plus several other realistic rooms, packages, and services; Spanish COP prices (e.g. $450.000 COP/noche) clearly labeled as demo values.
- Prevent booking date overlap for same physical room; implement client validation and isolate a server/database validation point so concurrency-safe checks can be added with DB transaction/constraint. Never show unavailable services as selectable.
- Validate required fields and display friendly errors; loading, empty, success, and error states. Avoid dead buttons; all main navigation, filters, favorites, detail actions, payment choice and reservation draft interactions should work.
- Keep accessibility: keyboard focus, labels, contrast, responsive layout.
- Build complete UI and working demo interactions first; do not invent API credentials or claim payment/email/Google integrations are live.
- Make the first screen polished and visually striking, with the sidebar sections exactly as requested. The home/catalog should open with rooms, packages, reservations accessible from left. No dates/guest selectors on the home hero/header.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba0ced0e-70a8-4c1d-9648-5c87dad010e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
