# PAIE ROYALE — Roadmap

- [x] API contract v1 (`src/lib/api/types.ts`, `docs/API.md`)
- [ ] Backend Node/Express/MySQL in `backend/` (schema, migrations, seed, create-admin, tests) — in progress
- [ ] Frontend API layer (VITE_API_URL client, errors, retries, idempotency, session)
- [ ] Public pages on API: catalog, promotions (crossed price), home carousel (3 s) + exact slogan
- [ ] Booking flow: dates/guests → guest data → optional services → summary → simulated payment → confirmation + PDF
- [ ] Mis reservas: filters, pagination, cancel/refund, receipt download
- [ ] Auth: register, login, forgot/reset password, profile, route guards
- [ ] Admin: dashboard, rooms (+photos, rules, blocks), services, packages, promotions, reservations, calendar, users, payments/refunds, reports/exports, settings, audit
- [ ] End-to-end check against the running backend; Spanish root README
